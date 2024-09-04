import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entity/Comment';
import { PostCommentDto, UpdateCommentDto, ResponseCommentDto } from '../dto/CommentDto';
import { CommentRepository } from "../repository/CommentRepository";
import { mapToDto } from "../../../utils/mapper/Mapper";
import { User } from "../../user/entity/User";
import { Post } from "../../post/entity/Post";
import {InterestService} from "../../interest/service/InterestService";
import {PostService} from "../../post/service/PostService";
import {UserService} from "../../user/service/UserService";
import { PaginationDto } from "../../../utils/pagination/paginationDto";
import { PaginationResult } from "../../../utils/pagination/pagination";
import { emotionCategories} from "../../../constants/defaultCommentRelatedness";
import {scoreByEmotions} from "../../../utils/scoreEmotions/scoreByEmotions";
import { AlarmService } from "../../alarm/service/AlarmService";


@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentRepository)
        private readonly commentRepository: CommentRepository,
        private readonly postService: PostService,
        private readonly interestService: InterestService,
        private readonly userService: UserService,
        private readonly alarmService: AlarmService
    ) {}

    async create(createCommentDto: PostCommentDto, userFromToken :User): Promise<ResponseCommentDto> {
        const { postId, rating, comment } = createCommentDto;
        const post = await this.postService.findByIdForCreateComment(postId);
        const user = await this.userService.findByEmail(userFromToken.email);

        CommentService.ensureExists(user, post);
        await this.ensureUnique(user.id, post.id);

        let newComment = this.commentRepository.create({
            rating,
            comment,
            user,
            post,
        });

        newComment = await this.analyzeEmotions(newComment, post.category.id)

        await this.commentRepository.save(newComment);

        // 댓글 작성 후, 해당 포스트에 달린 댓글을 모두 가져오기
        const comments = await this.findByPostId(postId);
        const nicknames = comments.map(comment => comment.user.nickname);
        
        // 알림 생성 및 전송
        await this.alarmService.createAndSendAlarms(postId, nicknames,user.nickname);

        await Promise.allSettled([
            this.updatePostAverageRating(postId),
            this.updateUserInterest(user.id, post, rating),
            this.updateUserInterest(user.id, post, rating),
            this.alarmService.createAlarm({
                type: 'comment',
                postId: postId,
            })
        ]);
        
        // 댓글 작성 후, 해당 포스트에 달린 댓글을 모두 가져와서 알림을 생성 및 전송
        await this.alarmService.sendUnsentAlarms();

        return mapToDto(newComment,ResponseCommentDto);
    }

    private static ensureExists(user: User, post: Post) {
        if (!user || !post) {
            throw new NotFoundException("User or Post not found");
        }
    }

    async findById(id: number): Promise<ResponseCommentDto> {
        const comment = await this.commentRepository.findById(id);
        this.checkCommentExists(comment, id);
        return mapToDto(comment,ResponseCommentDto);
    }

    async findByPostId(postId: number): Promise<ResponseCommentDto[]> {
        const comments = await this.commentRepository.findByPostId(postId);
        return comments.map(comment =>  mapToDto(comment,ResponseCommentDto));
    }

    async findByUserId(userId: number, paginationDto: PaginationDto): Promise<PaginationResult<ResponseCommentDto>> {
        const { page, limit, field, order } = paginationDto;
        const paginationOptions = { page, limit, field, order };

        const paginatedComments = await this.commentRepository.findByUserId(userId, paginationOptions);

        const responseData = paginatedComments.data.map(comment => mapToDto(comment, ResponseCommentDto));

        return {
            ...paginatedComments,
            data: responseData,
            total: paginatedComments.total,
            limit: paginatedComments.limit,
            page: paginatedComments.page
        };
    }

    async update(id: number, updateCommentDto: UpdateCommentDto): Promise<ResponseCommentDto> {
        let comment = await this.commentRepository.findById(id);
        this.checkCommentExists(comment, id);

        Object.assign(comment, updateCommentDto);
        comment = await this.analyzeEmotions(comment, comment.post.category.id)
        await this.commentRepository.save(comment);
        await this.updatePostAverageRating(comment.post.id);
        await this.updateUserInterest(comment.user.id, comment.post, comment.rating);

        return  mapToDto(comment,ResponseCommentDto);
    }

    async remove(id: number): Promise<void> {
        const comment = await this.commentRepository.findById(id);
        this.checkCommentExists(comment, id);

        const postId= comment.post.id;
        await this.commentRepository.remove(comment);
        await this.updatePostAverageRating(postId);
        await this.updateUserInterest(comment.user.id, comment.post,comment.rating);

    }

    private async updateUserInterest(userId: number, post: Post, rating: number): Promise<void> {
        await this.interestService.updateUserInterests(userId, post.interests);
    }

    private checkCommentExists(comment: Comment, id: number): void {
        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }
    }

    async ensureUnique(userId: number, postId: number): Promise<void> {
        const existingComment = await this.commentRepository.findByUserAndPost(userId, postId);
        if (existingComment) {
            throw new ConflictException('User has already commented on this post');
        }
    }

    async updatePostAverageRating(postId: number): Promise<void> {
        await this.commentRepository.updatePostAverageRating(postId);
    }

    private async analyzeEmotions (comment: Comment, categoryId: number): Promise<Comment> {
        const relatedWords = emotionCategories[categoryId];

        if (!relatedWords) {
            console.error('Invalid category ID');
            return;
        }
        const emotionScores = this.scoreEmotions(comment, relatedWords);

        comment.joyScore = emotionScores.joy;
        comment.angerScore = emotionScores.anger;
        comment.irritationScore = emotionScores.irritation;
        comment.fearScore = emotionScores.fear;
        comment.sadnessScore = emotionScores.sadness;

        return comment;
    }

    private scoreEmotions(comment: Comment, relatedWords: any[]): { joy: number, anger: number, irritation: number, fear: number, sadness: number } {
        const commentWords = comment.comment.split(/[\s.,!?"'()]+/);
        const emotionScores = {
            joy: 0,
            anger: 0,
            irritation: 0,
            fear: 0,
            sadness: 0
        };

        scoreByEmotions(commentWords, relatedWords, emotionScores);
        return emotionScores;
    }

}