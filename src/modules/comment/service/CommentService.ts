import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entity/Comment';
import { PostCommentDto, UpdateCommentDto, ResponseCommentDto } from '../dto/CommentDto';
import { CommentRepository } from "../repository/CommentRepository";
import { UserRepository } from "../../user/repository/UserRepository";
import { PostRepository } from "../../post/repository/PostRepository";
import { mapToDto } from "../../../utils/mapper/Mapper";
import { User } from "../../user/entity/User";
import { Post } from "../../post/entity/Post";
import {CategoryService} from "../../category/service/CategoryService";
import {InterestService} from "../../interest/service/InterestService";
import {PostService} from "../../post/service/PostService";


@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentRepository)
        private readonly commentRepository: CommentRepository,
        private readonly postService: PostService,
        private readonly interestService: InterestService,
    ) {}

    async create(createCommentDto: PostCommentDto, user :User): Promise<ResponseCommentDto> {
        const { postId, rating, comment } = createCommentDto;
        const post = await this.postService.findByIdForCreateComment(postId);

        CommentService.ensureExists(user, post);
        await this.ensureUnique(user.id, post.id);

        const newComment = this.commentRepository.create({
            rating,
            comment,
            user,
            post,
        });

        await this.commentRepository.save(newComment);

        await this.updatePostAverageRating(postId);
        await this.updateUserInterest(user.id, post,rating);

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

    async findByUserId(userId: number): Promise<ResponseCommentDto[]> {
        const comments = await this.commentRepository.findByUserId(userId);
        return comments.map(comment =>  mapToDto(comment,ResponseCommentDto));
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
        const result = await this.commentRepository
            .createQueryBuilder('comment')
            .select('AVG(comment.rating)', 'averageRating')
            .where('comment.post.id = :postId', { postId })
            .getRawOne();

        let averageRating = parseFloat(result.averageRating);
        if (isNaN(averageRating)) averageRating = 0;

        await this.postService.updateAverageRating(postId, { averageRating: averageRating });
    }

}