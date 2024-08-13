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
import * as emotions from "../../../constants/defaultCommentRelatedness"

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentRepository)
        private readonly commentRepository: CommentRepository,
        private readonly postService: PostService,
        private readonly interestService: InterestService,
        private readonly userService: UserService,
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

        newComment = await this.analyze(newComment, post.category.id)

        await this.commentRepository.save(newComment);

        await Promise.allSettled([
            this.updatePostAverageRating(postId),
            this.updateUserInterest(user.id, post, rating),
        ]);

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
        const comment = await this.commentRepository.findById(id);
        this.checkCommentExists(comment, id);

        Object.assign(comment, updateCommentDto);
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

    private async analyze(comment: Comment, categoryId: number): Promise<Comment> {
        const relatedWords = emotionCategories[categoryId];

        if (!relatedWords) {
            console.error('Invalid category ID');
            return;
        }

        const commentWords = comment.comment.split(/[\s.,!?"'()]+/);
        const emotionScores = {
            joy: 0,
            anger: 0,
            irritation: 0,
            shyness: 0,
            sadness: 0
        };

        commentWords.forEach(word => {
            relatedWords.forEach((emotionObject, index) => {
                if (emotionObject[word]) {
                    switch (index) {
                        case 0:
                            emotionScores.joy += emotionObject[word];
                            break;
                        case 1:
                            emotionScores.anger += emotionObject[word];
                            break;
                        case 2:
                            emotionScores.irritation += emotionObject[word];
                            break;
                        case 3:
                            emotionScores.shyness += emotionObject[word];
                            break;
                        case 4:
                            emotionScores.sadness += emotionObject[word];
                            break;
                    }
                }
            });
        });

        comment.joyScore = emotionScores.joy;
        comment.angerScore = emotionScores.anger;
        comment.irritationScore = emotionScores.irritation;
        comment.shynessScore = emotionScores.shyness;
        comment.sadnessScore = emotionScores.sadness;

        return comment;
    }

}