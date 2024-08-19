import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject, filter, map } from "rxjs";
import { AlarmRepository } from '../repository/AlarmRepository';
import { UserRepository } from '../../user/repository/UserRepository';
import { PostRepository } from '../../post/repository/PostRepository';
import { Alarm } from '../entity/Alarm';
import { CreateAlarmDto, UpdateAlarmStatusDto } from '../dto/AlarmDto';
import { UserService } from 'src/modules/user/service/UserService';
import { PostService } from 'src/modules/post/service/PostService';
import { Comment } from 'src/modules/comment/entity/Comment';
@Injectable()
export class AlarmService {
   
    constructor(
        private readonly alarmRepository: AlarmRepository,
        private readonly userService: UserService,
        private readonly postRepository: PostRepository,
    ) {}
    // // triggerAlarm 메서드 추가
    // triggerAlarm(userId: number, title: string, message: string): void {
    //     this.createAlarm({
    //         message: `${title}: ${message}`,
    //         type: 'general', // 적절한 타입 설정
    //         url: '/', // 적절한 URL 설정
    //     });
    // }
    // 알림 생성 및 이벤트 발생
    async createAlarm(postId: number, comment:Comment): Promise<Alarm> {
        const newAlarm = this.alarmRepository.create({
            postId:postId,
            message:`댓글알림:${comment.comment}`,
            type:'댓글',
            is_read:false,
        });
        const savedAlarm = await this.alarmRepository.save(newAlarm);
        this.emitAlarmEvent(postId);
        return savedAlarm;
    }
    
    async deleteAlarm(id: number): Promise<void> {
        const alarm = await this.findAlarmById(id);
        await this.checkError(() => this.alarmRepository.delete(alarm.id), 'Failed to delete alarm');
    }

    private async findAlarmById(id: number) {
        const alarm = await this.alarmRepository.findById(id);
        this.ensureExists(alarm, id, 'Alarm');
        return alarm;
    }
    private ensureExists(entity: any, id: number, entityName: string): void {
        if (!entity) {
            throw new NotFoundException(`${entityName} with ID ${id} not found`);
        }
    }

    private async checkError<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw new BadRequestException(errorMessage);
        }
    }
    // 특정 사용자의 모든 알림 조회
    async getUserAlarms(userId: number): Promise<Alarm[]> {
        return await this.alarmRepository.findAllByUserId(userId);
    }

    // 특정 사용자의 읽지 않은 알림 조회
    async getUnreadAlarms(userId: number): Promise<Alarm[]> {
        return await this.alarmRepository.findUnreadByUserId(userId);
    }

    // 알림 읽음 처리
    async updateAlarmStatus(alarmId: number, updateAlarmStatusDto: UpdateAlarmStatusDto): Promise<void> {
        if (updateAlarmStatusDto.is_read) {
            await this.alarmRepository.markAsRead(alarmId);
        }
    }

    

    // SSE 이벤트 발생 함수
    private emitAlarmEvent(postId: number): void {
        // SSE 이벤트를 트리거하는 로직을 여기에 추가
        //this.sseService.emitAlarmEvent(userId);
    }

    sendClientAlarm(userId: number): Observable<MessageEvent> {
        return new Observable(observer => {
            const event = {
                data: { message: `유저 ${userId}에게 새로운 알림이 도착했습니다.` },
            };
            observer.next(event as MessageEvent);
        });
    }
    // async handleNewCommentAlarm(postId: number, commenterId: number): Promise<void> {
    //     // 댓글이 달린 게시글의 작성자와 댓글 작성자가 동일하지 않을 경우 알림을 전송합니다.
    //     const post = await this.postRepository.findOne({
    //         where: { id: postId },
    //         relations: ['user'],
    //     });
    
    //     if (post.user.id !== commenterId) {
    //         await this.createAlarm({
    //             userId: post.user.id,
    //             message: `새로운 댓글이 달렸습니다.`,
    //             type: 'comment',
    //             url: `/post/${postId}`, // 댓글이 달린 게시글로 이동하는 URL
    //         });
    //     }
    // }
    

    // // 새로운 추천 항목 알림 전송
    // async handleNewRecommendationAlarm(userId: number, recommendation: string): Promise<void> {
    //     await this.createAlarm({
    //         userId,
    //         message: `새로운 추천 항목: ${recommendation}`,
    //         type: 'recommendation',
    //         url: `/recommendation/${recommendation}`, // 추천 항목 페이지로 이동하는 URL
    //     });
    // }
}
