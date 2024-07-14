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


@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentRepository)
    private readonly commentRepository: CommentRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
  ) {}

  async create(createCommentDto: PostCommentDto,reqUserEmail:string): Promise<ResponseCommentDto> {
    const { postId, rating, comment } = createCommentDto;

    const user = await this.userRepository.findByEmail(reqUserEmail);
    const post = await this.postRepository.findById(postId);

    CommentService.ensureExists(user, post);
    await this.ensureUnique(user.id, post.id);

    const newComment = this.commentRepository.create({
      rating,
      comment,
      user,
      post,
    });
    await this.commentRepository.save(newComment);
    await this.updatePostScore(postId);
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
    await this.updatePostScore(comment.post.id);
    return  mapToDto(comment,ResponseCommentDto);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    this.checkCommentExists(comment, id);
    await this.commentRepository.remove(comment);
    await this.updatePostScore(comment.post.id);
  }


  private checkCommentExists(comment: Comment, id: number): void {
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }

  private async ensureUnique(userId: number, postId: number): Promise<void> {
    const existingComment = await this.commentRepository.findOne({ where: { user: { id: userId }, post: { id: postId } } });
    if (existingComment) {
      throw new ConflictException('User has already commented on this post');
    }
  }

  async updatePostScore(postId: number): Promise<void> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'averageRating')
      .where('comment.postId = :postId', { postId })
      .getRawOne();

    const averageRating = parseFloat(result.averageRating).toFixed(1);

    await this.postRepository.update(postId, { score: parseFloat(averageRating) });
  }

}