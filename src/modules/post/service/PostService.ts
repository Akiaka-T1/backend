import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Post} from '../entity/Post';
import {PostPostDto, ResponsePostDto, ShortContentPostDto, ThumbnailPostDto, UpdatePostDto} from '../dto/PostDto';
import {PaginationOptions, PaginationResult} from '../../../utils/pagination/pagination';
import {PaginationDto} from '../../../utils/pagination/paginationDto';
import {mapToDto} from "../../../utils/mapper/Mapper";
import {UserService} from "../../user/service/UserService";
import {PostRepository} from "../repository/PostRepository";
import {User} from "../../user/entity/User";
import {InterestService} from "../../interest/service/InterestService";
import {CategoryService} from "../../category/service/CategoryService";
import {RecommendationService} from "../../recommendation/service/RecommendationService";
import {DailyViewRepository} from "../repository/DailyViewRepository";
import {emotionCategories} from "../../../constants/defaultPostRelatedness";
import {scoreByEmotions} from "../../../utils/scoreEmotions/scoreByEmotions";
import * as striptags from 'striptags';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly categoryService: CategoryService,
    private readonly interestService: InterestService,
    private readonly userService: UserService,
    private readonly dailyViewRepository: DailyViewRepository,
    private readonly recommendationService: RecommendationService
  ) {}

  async create(postPostDto: PostPostDto, userId: number): Promise<ResponsePostDto> {
    const user = await this.userService.findById(userId);
    const category = await this.categoryService.findOne(postPostDto.categoryId );
    if (!category) {
      throw new NotFoundException(`Category with ID ${postPostDto.categoryId} not found`);
    }

    const preview = await this.createPreview(postPostDto.content);

    let post = this.postRepository.create({
      ...postPostDto,
      user,
      category,
      preview: preview,
    });

    post = await this.analyzeEmotions(post, post.category.id)
    post = await this.addInterestsByScore(post);

    await this.postRepository.save(post);

    return mapToDto(post, ResponsePostDto);
  }

  async stripHtml(content: string): Promise<string> {
    return striptags(content);
  }

  async findOne(id: number, user: User | null): Promise<ResponsePostDto> {
    const post = await this.postRepository.findById(id);
    this.ensureExists(post, id);

    if (user) {
      await this.categoryService.createOrIncrementMiddleEntityViews(user.id, post.category);
      await this.recommendationService.createOrIncrementMiddleEntityScore(user, post);
    }

    post.views++;
    await this.postRepository.save(post);

    await this.dailyViewRepository.incrementViewCount(post.id);

    return mapToDto(post, ResponsePostDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ShortContentPostDto>> {
    const options: PaginationOptions = {
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 5,
      field: paginationDto.field,
      order: paginationDto.order,
    };

    const posts = await this.postRepository.findAll(options);

    return {
      ...posts,
      data: posts.data.map(post => mapToDto(post, ShortContentPostDto)),
    };
  }

  async searchPostsByTitle(title: string, paginationDto: PaginationDto): Promise<PaginationResult<ShortContentPostDto>> {
    const { page, limit, field, order } = paginationDto;
    const options = { page, limit, field, order };

    const posts = await this.postRepository.searchByTitle(title, options);
    return {
      ...posts,
      data: posts.data.map(post => mapToDto(post, ShortContentPostDto)),
    };
  }

  async findByIdForCreateComment(id: number): Promise<Post | undefined> {
      return this.postRepository.findByIdWithInterestsAndCategoryOnlyWithTitle(id)
  }

  async update(id: number, updatePostDto: UpdatePostDto, jwtUser:User): Promise<ResponsePostDto> {
    let post = await this.postRepository.findById(id);
    this.ensureExists(post, id);
    this.checkQualified(post, jwtUser);
    Object.assign(post, updatePostDto);
    post.preview = (await this.stripHtml(post.content)).substring(0, 255);
    post = await this.analyzeEmotions(post, post.category.id)
    const updatedPost = await this.handleErrors(() => this.postRepository.save(post), 'Failed to update post');
    return mapToDto(updatedPost,ResponsePostDto);
  }

  async remove(id: number): Promise<void> {
    const post = await this.postRepository.findById(id);
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

  private async createPreview(content: string): Promise<string> {
    let preview = (await this.stripHtml(content)).substring(0, 255);
    const lastIndex = Math.max(preview.lastIndexOf(' '), preview.lastIndexOf('\n'));
    if (lastIndex > 0) preview = preview.substring(0, lastIndex).replace(/\s+$/, '');
    return preview;
  }

  private async analyzeEmotions (post: Post, categoryId: number): Promise<Post> {
    const relatedWords = emotionCategories[categoryId];

    if (!relatedWords) {
      throw new NotFoundException('Invalid category ID while analyzeEmotions');
    }
    const emotionScores = this.scoreEmotions(post, relatedWords);

    post.joyScore = emotionScores.joy;
    post.angerScore = emotionScores.anger;
    post.irritationScore = emotionScores.irritation;
    post.fearScore = emotionScores.fear;
    post.sadnessScore = emotionScores.sadness;

    return post;
  }

  private scoreEmotions(post: Post, relatedWords: any[]) {
    const postWords = post.preview.split(/[\s.,!?"'()]+/);
    const emotionScores = {
      joy: 0,
      anger: 0,
      irritation: 0,
      fear: 0,
      sadness: 0
    };
    scoreByEmotions(postWords, relatedWords, emotionScores);
    return emotionScores;
  }

  private async addInterestsByScore(post: Post):Promise<Post> {
    const emotionInterestMap: { [key: string]: number } = {
      '기쁨': post.joyScore,
      '버럭': post.angerScore,
      '까칠': post.irritationScore,
      '소심': post.fearScore,
      '슬픔': post.sadnessScore,
    };

    const interestNames = Object.keys(emotionInterestMap).filter(key => emotionInterestMap[key] > 0);
    post.interests = await this.interestService.findByNamesForCreatePost(interestNames);

    return post;
  }

  public async handleErrors<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new BadRequestException(errorMessage);
    }
  }

}
