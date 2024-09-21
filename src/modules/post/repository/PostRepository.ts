import { Injectable } from "@nestjs/common";
import { DataSource, FindManyOptions, Like, Repository } from "typeorm";
import { Post } from "../entity/Post";
import { Comment } from "../../comment/entity/Comment"; 
import {
  paginate,
  paginateWithQueryBuilder,
  PaginationOptions,
  PaginationResult
} from "../../../utils/pagination/pagination";

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
  async findById(id: number): Promise<Post | undefined> {
    return this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.interests', 'interests')
      .leftJoin('post.comments', 'comments')
      .leftJoin('comments.user', 'commentUser')
      .leftJoinAndSelect('post.postRecommendations', 'postRecommendations')
      .addSelect(['comments.id', 'comments.rating', 'comments.comment', 'comments.joyScore', 'comments.angerScore', 'comments.irritationScore', 'comments.fearScore', 'comments.sadnessScore', 'comments.createdAt', 'comments.updatedAt'])
      .addSelect(['commentUser.id', 'commentUser.nickname'])
      .where('post.id = :id', { id })
      .getOne();
  }

    async findByIdWithInterestsAndCategoryOnlyWithTitle (id: number): Promise<Post | undefined> {
    return this.findOne({
      where: { id },
      relations: ['interests', 'category'],
      select: ['id', 'title']
    });
    }

  

    async findAll(paginationDto: PaginationOptions): Promise<PaginationResult<Post>> {
        const queryBuilder = this.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoinAndSelect("post.category", "category")
            .leftJoinAndSelect("post.comments", "comments")
            .select([
                "post.id",
                "post.title",
                "post.preview",
                "post.createdAt",
                "post.updatedAt",
                "post.thumbnailURL",
                "post.views",
                "post.averageRating",
                "post.joyScore",
                "post.angerScore",
                "post.irritationScore",
                "post.fearScore",
                "post.sadnessScore"
            ]);

        return paginateWithQueryBuilder(queryBuilder, paginationDto);
    }

    async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Post>): Promise<PaginationResult<Post>> {
        return paginate(this, options, findOptions);
    }

    async calculateAverageRating(postId: number) {
        await this.createQueryBuilder()
            .update(Post)
            .set({
              averageRating: () => `(SELECT AVG(comment.rating) FROM comment WHERE comment.post_id = post.id)`,
            })
            .where('id = :postId', { postId })
            .execute();
    }

    async searchByTitle(title: string, options: PaginationOptions): Promise<PaginationResult<Post>> {
        const findOptions: FindManyOptions<Post> = {
            where: [
                { title: Like(`%${title}%`) },
                { preview: Like(`%${title}%`) }
            ],
        };
    return paginate(this, options, findOptions);
    }
}
