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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly userService: UserService,
  ) {}

  async create(postPostDto: PostPostDto, userId: number): Promise<any> {
    const user = await this.userService.findById(userId);
    const post = this.postRepository.create({
      ...postPostDto,
      user,
    });

    await this.postRepository.save(post);
    return mapToDto(post,ResponsePostDto);
  }

  async findOne(id: number): Promise<ResponsePostDto> {
    const post = await this.postRepository.findById(id);
    this.ensureExists(post, id);
    post.views++;
    await this.postRepository.save(post);
    return mapToDto(post,ResponsePostDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
    const { page, limit, field, order } = paginationDto;
    const result = await this.handleErrors(
      () => paginate(this.postRepository, { page, limit, field, order }, { relations: ['user'] }),
      'Failed to fetch posts',
    );

    return {
      data: result.data.map(post => mapToDto(post,ShortPostDto)),
      total: result.total,
      page,
      limit,
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto, jwtUser:User): Promise<ResponsePostDto> {
    const post = await this.postRepository.findById(id);
    this.ensureExists(post, id);
    this.checkQualified(post, jwtUser);
    Object.assign(post, updatePostDto);
    const updatedPost = await this.handleErrors(() => this.postRepository.save(post), 'Failed to update post');
    return mapToDto(updatedPost,ResponsePostDto);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.handleErrors(() => this.postRepository.delete(post.id), 'Failed to delete post');
  }

  private ensureExists(post: Post, id: number): void {
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  private checkQualified(post: Post, userFromRequest: User) {
    if (post.user.email !== userFromRequest.email && userFromRequest.role !== "admin") throw new BadRequestException("Not authorized to update post");
  }

  private async handleErrors<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new BadRequestException(errorMessage);
    }
  }

}
