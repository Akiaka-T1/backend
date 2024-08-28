import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { AlarmRepository } from '../repository/AlarmRepository';
import { CreateAlarmDto } from '../dto/AlarmDto';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';
import { Observable, Subject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../user/repository/UserRepository';
import { CommentRepository } from '../../comment/repository/CommentRepository';

@Injectable()
export class AlarmService {
    private alarmStreams: Map<string, Subject<MessageEvent>> = new Map(); // Map의 키를 userId에서 nickname으로 변경

    constructor(
        private readonly alarmRepository: AlarmRepository,
        @InjectRepository(UserRepository) 
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

    // 알림 생성 및 전송 메서드 추가 (닉네임 기반)
    async createAndSendAlarms(postId: number, nicknames: string[]): Promise<void> {
        for (const nickname of nicknames) {
            // 닉네임으로 User 객체를 조회
            const user = await this.userRepository.findOne({ where: { nickname } });
            if (!user) {
                console.error(`User with nickname ${nickname} not found.`);
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
            this.sendAlarmToUser(nickname, {
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
            const uniqueNicknames = new Set(comments.map(comment => comment.user.nickname)); // 닉네임을 사용

            for (const nickname of uniqueNicknames) {
                const user = await this.userRepository.findOne({ where: { nickname } });

                if (!user) continue;

                const alarmSend = new AlarmSend();
                alarmSend.alarm = alarm;
                alarmSend.user = user;
                alarmSend.isRead = false;

                await this.alarmRepository.createAlarmSend(alarmSend);

                // SSE를 통해 사용자에게 알림을 전송하는 로직
                this.sendAlarmToUser(nickname, {
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

    // SSE를 통한 실시간 알림 전송 (닉네임 기반)
    sendClientAlarm(nickname: string): Observable<MessageEvent> {
        return new Observable<MessageEvent>(observer => {
            console.log(`SSE connection established for nickname: ${nickname}`);
            let userStream = this.alarmStreams.get(nickname);

            // 스트림이 존재하지 않는 경우 새로 생성
            if (!userStream) {
                userStream = new Subject<MessageEvent>();
                this.alarmStreams.set(nickname, userStream);
            }

            // 기존 또는 새로 생성된 스트림에 대해 구독 설정
            userStream.subscribe(event => {
                observer.next(event);
            });

            // SSE 연결이 닫힐 때 스트림 제거
            return () => {
                this.alarmStreams.delete(nickname);
            };
        });
    }

    // 특정 사용자에게 알림 전송 (닉네임 기반)
    private sendAlarmToUser(nickname: string, event: MessageEvent): void {
        const userStream = this.alarmStreams.get(nickname);
        if (userStream) {
            userStream.next(event);
        } else {
            console.error(`No stream found for nickname: ${nickname}`);
        }
    }

    broadcastTestEventToUser(nickname: string): void {
        const testEvent: MessageEvent = { data: JSON.stringify({ message: 'This is a test event from the server!' }) };
        this.sendAlarmToUser(nickname, testEvent);
    }

    async getAlarmsForUser(nickname: string): Promise<AlarmSend[]> {
        const user = await this.userRepository.findOne({ where: { nickname } });
        if (!user) {
            throw new NotFoundException(`User with nickname ${nickname} not found`);
        }
        return this.alarmRepository.findAllAlarmSendsByUserId(user.id);
    }

    // 특정 알림 전송 정보를 읽음 상태로 업데이트
    async markAlarmAsRead(alarmSendId: number): Promise<void> {
        await this.alarmRepository.markAlarmSendAsRead(alarmSendId);
    }
}
