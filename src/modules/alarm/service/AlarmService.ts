import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { AlarmRepository } from '../repository/AlarmRepository';
import { CreateAlarmDto } from '../dto/AlarmDto';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';
import { Observable, Subject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../user/repository/UserRepository';
import { CommentRepository } from '../../comment/repository/CommentRepository';
export const alarmStreams: Map<string, Subject<MessageEvent>> = new Map();

@Injectable()
export class AlarmService {
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

    // 알림 생성 및 전송 메서드 추가 (닉네임 기반)
    async createAndSendAlarms(postId: number, nicknames: string[]): Promise<void> {
        for (const nickname of nicknames) {
            const user = await this.userRepository.findOne({ where: { nickname } });
            if (!user) {
                console.error(`User with nickname ${nickname} not found.`);
                continue;
            }

            const alarm = new Alarm();
            alarm.type = 'comment';
            alarm.postId = postId;
            alarm.sendCheck = false;

            const savedAlarm = await this.alarmRepository.createAlarm(alarm);

            const alarmSend = new AlarmSend();
            alarmSend.alarm = savedAlarm;
            alarmSend.user = user;
            alarmSend.isRead = false;

            await this.alarmRepository.createAlarmSend(alarmSend);

            this.sendAlarmToUser(nickname, {
                data: JSON.stringify({
                    message: '새로운 댓글이 달렸습니다.',
                    postId: postId,
                }),
            });
        }
    }

    async sendUnsentAlarms(): Promise<void> {
        const unreadAlarms = await this.alarmRepository.findUnreadAlarms();

        for (const alarm of unreadAlarms) {
            const comments = await this.commentRepository.findByPostId(alarm.postId);
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
                    data: JSON.stringify({ message: `New alarm for postId ${alarm.postId}`, alarmId: alarmSend.id })
                });
            }

            await this.alarmRepository.markAlarmAsConsumed(alarm.id);
        }
    }

    async deleteAlarm(id: number): Promise<void> {
        const alarm = await this.alarmRepository.findOneAlarm(id);
        if (!alarm) {
            throw new NotFoundException('Alarm not found');
        }
        await this.alarmRepository.removeAlarm(alarm);
    }

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

    private sendAlarmToUser(nickname: string, event: MessageEvent): void {
        const userStream = alarmStreams.get(nickname);
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

    async markAlarmAsRead(alarmSendId: number): Promise<void> {
        await this.alarmRepository.markAlarmSendAsRead(alarmSendId);
    }
}