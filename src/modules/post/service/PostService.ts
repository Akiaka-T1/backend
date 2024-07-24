import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entity/Post';
import {PostPostDto, UpdatePostDto, ResponsePostDto, ShortPostDto} from '../dto/PostDto';
import { paginate, PaginationResult } from '../../../utils/pagination/pagination';
import { PaginationDto } from '../../../utils/pagination/paginationDto';
import { mapToDto } from "../../../utils/mapper/Mapper";
import { UserService } from "../../user/service/UserService";
import { PostRepository } from "../repository/PostRepository";
import { User } from "../../user/entity/User";
import {InterestService} from "../../interest/service/InterestService";
import {CategoryService} from "../../category/service/CategoryService";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly categoryService: CategoryService,
    private readonly interestService: InterestService,
    private readonly userService: UserService,
  ) {}

  async create(postPostDto: PostPostDto, userId: number): Promise<ResponsePostDto> {
    const user = await this.userService.findById(userId);
    const category = await this.categoryService.findOne(postPostDto.categoryId );
    if (!category) {
      throw new NotFoundException(`Category with ID ${postPostDto.categoryId} not found`);
    }

    const interests = await this.interestService.findByIdsForCreatePost(postPostDto.interestIds);
    if (interests.length !== postPostDto.interestIds.length) {
      throw new NotFoundException(`Some interests not found`);
    }

    const post = this.postRepository.create({
      ...postPostDto,
      user,
      category,
      interests,
    });

    await this.postRepository.save(post);
    return mapToDto(post, ResponsePostDto);
  }

  async findOne(id: number, user: User | null): Promise<ResponsePostDto> {
    const post = await this.postRepository.findById(id);
    this.ensureExists(post, id);

    if (user) {
      await this.categoryService.incrementMiddleEntityView(user.id, post.category);
    }

    post.views++;
    await this.postRepository.save(post);
    return mapToDto(post, ResponsePostDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
    const { page, limit, field, order } = paginationDto;
    const options = { page, limit, field, order };

    const posts = await this.postRepository.paginate(options);
    return {
      ...posts,
      data: posts.data.map(post => mapToDto(post, ShortPostDto)),
    };
  }

  async findByIdForCreateComment(id: number): Promise<Post | undefined> {
      return this.postRepository.findByIdWithInterestsAndCategoryOnlyWithTitle(id)
  }

    async update(id: number, updatePostDto: UpdatePostDto, jwtUser:User): Promise<ResponsePostDto> {
    const post = await this.postRepository.findById(id);
    this.ensureExists(post, id);
    this.checkQualified(post, jwtUser);
    Object.assign(post, updatePostDto);
    const updatedPost = await this.handleErrors(() => this.postRepository.save(post), 'Failed to update post');
    return mapToDto(updatedPost,ResponsePostDto);
  }

  async updateScore(postId: number): Promise<void> {
    const averageRating = await this.postRepository.calculateAverageRating(postId);
    await this.postRepository.update(postId, { averageRating: parseFloat(averageRating) });
  }

  async remove(id: number): Promise<void> {
    const post = await this.postRepository.findById(id);
    await this.postRepository.removeInterestsFromPost(post);
    await this.handleErrors(() => this.postRepository.delete(post.id), 'Failed to delete post');
  }

  async updateAverageRating(postId: number, averageRating: { averageRating: number }): Promise<void> {
    await this.postRepository.update(postId, averageRating);
  }

  private ensureExists(post: Post, id: number): void {
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  private checkQualified(post: Post, userFromRequest: User) {
    if (post.user.email !== userFromRequest.email && userFromRequest.role !== "admin") throw new BadRequestException("Not authorized to update post");
  }

  public async handleErrors<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new BadRequestException(errorMessage);
    }
  }

}
