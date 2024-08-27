import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { AlarmRepository } from '../repository/AlarmRepository';
import { CreateAlarmDto } from '../dto/AlarmDto';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';
import { Observable, Subject } from 'rxjs';
import { UserRepository } from '../../user/repository/UserRepository';
import { CommentRepository } from '../../comment/repository/CommentRepository';
@Injectable()
export class AlarmService {
    private alarmStreams: Map<number, Subject<MessageEvent>> = new Map();

    constructor(
        private readonly alarmRepository: AlarmRepository,
        private readonly userRepository: UserRepository,
        private readonly commentRepository: CommentRepository,
    ) {}

    // 새로운 알림 생성
    async createAlarm(createAlarmDto: CreateAlarmDto): Promise<Alarm> {
        const { type, postId } = createAlarmDto;

        const alarm = new Alarm();
        alarm.type = type;
        alarm.postId = postId;
        alarm.sendCheck = false;

        return this.alarmRepository.createAlarm(alarm);
    }

    // 알림 생성 및 전송 메서드 추가
    async createAndSendAlarms(postId: number, userIds: number[]): Promise<void> {
        for (const userId of userIds) {
            // userId로 User 객체를 조회
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                console.error(`User with ID ${userId} not found.`);
                continue;
            }
    
            // 알림 생성
            const alarm = new Alarm();
            alarm.type = 'comment'; // 댓글 알림 타입
            alarm.postId = postId;
            alarm.sendCheck = false; // 초기엔 전송되지 않은 상태
    
            const savedAlarm = await this.alarmRepository.createAlarm(alarm);
    
            // 알림 전송 엔티티 생성
            const alarmSend = new AlarmSend();
            alarmSend.alarm = savedAlarm;
            alarmSend.user = user;  // 조회한 User 객체를 할당
            alarmSend.isRead = false;
    
            await this.alarmRepository.createAlarmSend(alarmSend);
    
            // 실시간 알림 전송
            this.sendAlarmToUser(userId, {
                data: JSON.stringify({
                    message: '새로운 댓글이 달렸습니다.',
                    postId: postId,
                }),
            });
        }
    }
    // 아직 안 보내진 알림들을 찾아서 관련된 모든 사용자에게 알림 전송 -> 상태 업데이트
    async sendUnsentAlarms(): Promise<void> {
        const unreadAlarms = await this.alarmRepository.findUnreadAlarms();

        for (const alarm of unreadAlarms) {
            const comments = await this.commentRepository.findCommentsByPostId(alarm.postId);
            const uniqueUserIds = new Set(comments.map(comment => comment.user.id));

            for (const userId of uniqueUserIds) {
                const user = await this.userRepository.findOne({ where: { id: userId } });

                if (!user) continue;

                const alarmSend = new AlarmSend();
                alarmSend.alarm = alarm;
                alarmSend.user = user;
                alarmSend.isRead = false;

                await this.alarmRepository.createAlarmSend(alarmSend);

                // SSE를 통해 사용자에게 알림을 전송하는 로직
                this.sendAlarmToUser(userId, {
                    data: JSON.stringify({ message: `New alarm for postId ${alarm.postId}`, alarmId: alarmSend.id })
                });
            }

            await this.alarmRepository.markAlarmAsConsumed(alarm.id);
        }
    }

    // 특정 알림 삭제
    async deleteAlarm(id: number): Promise<void> {
        const alarm = await this.alarmRepository.findOneAlarm(id);
        if (!alarm) {
            throw new NotFoundException('Alarm not found');
        }
        await this.alarmRepository.removeAlarm(alarm);
    }

    // SSE를 통한 실시간 알림 전송
    sendClientAlarm(userId: number): Observable<MessageEvent> {
        return new Observable<MessageEvent>(observer => {
            let userStream = this.alarmStreams.get(userId);
    
            // 스트림이 존재하지 않는 경우 새로 생성
            if (!userStream) {
                userStream = new Subject<MessageEvent>();
                this.alarmStreams.set(userId, userStream);
            }
    
            // 기존 또는 새로 생성된 스트림에 대해 구독 설정
            userStream.subscribe(event => {
                observer.next(event);
            });
    
            // SSE 연결이 닫힐 때 스트림 제거
            return () => {
                this.alarmStreams.delete(userId);
            };
        });
    }

    // 특정 사용자에게 알림 전송
    private sendAlarmToUser(userId: number, event: MessageEvent): void {
        const userStream = this.alarmStreams.get(userId);
        if (userStream) {
            userStream.next(event);
        } else {
            console.error(`No stream found for userId: ${userId}`);
        }
    }

    broadcastTestEventToUser(userId: number): void {
        const testEvent: MessageEvent = { data: JSON.stringify({ message: 'This is a test event from the server!' }) };
        this.sendAlarmToUser(userId, testEvent);
    }

    async getAlarmsForUser(userId: number): Promise<AlarmSend[]> {
        return this.alarmRepository.findAllAlarmSendsByUserId(userId);
    }

    // 특정 알림 전송 정보를 읽음 상태로 업데이트
    async markAlarmAsRead(alarmSendId: number): Promise<void> {
        await this.alarmRepository.markAlarmSendAsRead(alarmSendId);
    }
}
