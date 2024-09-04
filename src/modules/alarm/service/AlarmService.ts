import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { AlarmRepository } from '../repository/AlarmRepository';
import { CreateAlarmDto } from '../dto/AlarmDto';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';
import { Observable, Subject } from 'rxjs';
import { UserRepository } from '../../user/repository/UserRepository';
import { CommentRepository } from '../../comment/repository/CommentRepository';
import { PostRepository } from 'src/modules/post/repository/PostRepository';

export const alarmStreams: Map<string, Subject<MessageEvent>> = new Map();

@Injectable()
export class AlarmService {
    constructor(
        private readonly alarmRepository: AlarmRepository,
        private readonly userRepository: UserRepository,
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) {}

    // 새로운 알림 생성
    async createAlarm(createAlarmDto: CreateAlarmDto): Promise<Alarm> {
        const { type, postId } = createAlarmDto;

        // Post를 찾아서 alarm에 연결
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        const alarm = new Alarm();
        alarm.type = type;
        alarm.post = post; // Post와 연결
        alarm.sendCheck = false;

        try {
            const savedAlarm = await this.alarmRepository.createAlarm(alarm);
            console.log(`Alarm created with ID: ${savedAlarm.id}`);
            return savedAlarm;
        } catch (error) {
            console.error('Error creating alarm:', error);
            throw new Error('Failed to create alarm');
        }
    }

    //postId로 Post 정보를 가져오는 메서드
    async getPostById(postId: number) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }
        return post;
    }
    // 알림 생성 및 전송 (닉네임 기반)
    async createAndSendAlarms(postId: number, nicknames: string[], currentUserNickname: string): Promise<void> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        for (const nickname of nicknames) {
            if (nickname === currentUserNickname) {
                console.log(`Skipping alert for the current user: ${nickname}`);
                continue;
            }

            const user = await this.userRepository.findOne({ where: { nickname } });
            if (!user) {
                console.error(`User with nickname ${nickname} not found.`);
                continue;
            }

            const alarm = new Alarm();
            alarm.type = 'comment';
            alarm.post = post; // Post와 연결
            alarm.sendCheck = false;

            const savedAlarm = await this.alarmRepository.createAlarm(alarm);

            const alarmSend = new AlarmSend();
            alarmSend.alarm = savedAlarm;
            alarmSend.user = user;
            alarmSend.isRead = false;

            await this.alarmRepository.createAlarmSend(alarmSend);

            // 알림 전송 시 postTitle을 포함하여 전송
            this.sendAlarmToUser(nickname, {
                data: JSON.stringify({
                    message: `${post.title}에 새로운 댓글이 달렸습니다.`,
                    postTitle: post.title, // postTitle을 전송
                }),
            });
            // 알림을 전송한 후 sendCheck를 true로 변경
            await this.alarmRepository.markAlarmAsConsumed(alarm.id);

        }
    }

    // 전송되지 않은 알림 전송
    async sendUnsentAlarms(): Promise<void> {
        const unreadAlarms = await this.alarmRepository.findUnreadAlarms();

        for (const alarm of unreadAlarms) {
            const comments = await this.commentRepository.findByPostId(alarm.post.id); // 수정
            const uniqueNicknames = new Set(comments.map(comment => comment.user.nickname));

            for (const nickname of uniqueNicknames) {
                const user = await this.userRepository.findOne({ where: { nickname } });

                if (!user) continue;

                const alarmSend = new AlarmSend();
                alarmSend.alarm = alarm;
                alarmSend.user = user;
                alarmSend.isRead = false;

                await this.alarmRepository.createAlarmSend(alarmSend);

                this.sendAlarmToUser(nickname, {
                    data: JSON.stringify({
                        message: '새로운 댓글이 달렸습니다.', // 수정
                        alarmId: alarmSend.id,
                        postTitle: alarm.post.title, // postTitle 추가
                    }),
                });
            }

            await this.alarmRepository.markAlarmAsConsumed(alarm.id);
        }
    }

    // 알림 삭제
    async deleteAlarm(id: number): Promise<void> {
        const alarm = await this.alarmRepository.findOneAlarm(id);
        if (!alarm) {
            console.error(`Alarm with id ${id} not found in the database.`);
            throw new NotFoundException('Alarm not found');
        }
        await this.alarmRepository.removeAlarm(alarm);
    }

    // 실시간 알림 전송 (SSE)
    sendClientAlarm(nickname: string): Observable<MessageEvent> {
        return new Observable<MessageEvent>(observer => {
            console.log(`SSE connection established for nickname: ${nickname}`);
            let userStream = alarmStreams.get(nickname);

            if (!userStream) {
                userStream = new Subject<MessageEvent>();
                alarmStreams.set(nickname, userStream);
            }

            userStream.subscribe(event => {
                observer.next(event);
            });

            return () => {
                console.log(`SSE disconnection: ${nickname}`);
                alarmStreams.delete(nickname);
            };
        });
    }

    // 사용자에게 알림 전송
    private sendAlarmToUser(nickname: string, event: MessageEvent): void {
        const userStream = alarmStreams.get(nickname);
        if (userStream) {
            userStream.next(event);
        } else {
            console.error(`No stream found for nickname: ${nickname}`);
        }
    }

    // 테스트 이벤트
    broadcastTestEventToUser(nickname: string): void {
        const testEvent: MessageEvent = { data: JSON.stringify({ message: 'This is a test event from the server!' }) };
        this.sendAlarmToUser(nickname, testEvent);
    }

    // 사용자 알림 조회
    async getAlarmsForUser(nickname: string): Promise<AlarmSend[]> {
        const user = await this.userRepository.findOne({ where: { nickname } });
        if (!user) {
            throw new NotFoundException(`User with nickname ${nickname} not found`);
        }

        return this.alarmRepository.findAllAlarmSendsByUserId(user.id);
    }

    // 알림 읽음 처리
    async markAlarmAsRead(alarmSendId: number): Promise<void> {
        await this.alarmRepository.markAlarmSendAsRead(alarmSendId);
    }

    // 사용자 전체 알림 삭제
    async deleteUserAlarms(nickname: string): Promise<void> {
        const alarms = await this.getAlarmsForUser(nickname);
        for (const alarmSend of alarms) {
            await this.alarmRepository.removeAlarm(alarmSend.alarm);
        }
    }
}
