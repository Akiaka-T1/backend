import { Injectable } from "@nestjs/common";
import {DataSource, FindManyOptions, Like, Repository} from "typeorm";
import { Post } from "../entity/Post";
import {PaginationResult,PaginationOptions,paginate} from "../../../utils/pagination/pagination";

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
  async findById(id: number): Promise<Post | undefined> {
    return this.findOne({ where: { id }, relations: ['user','category','interests','comments'] });
  }

  async findByIdWithInterestsAndCategoryOnlyWithTitle (id: number): Promise<Post | undefined> {
    return this.findOne({
      where: { id },
      relations: ['interests', 'category'],
      select: ['id', 'title']
    });
  }

  async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Post>): Promise<PaginationResult<Post>> {
    return paginate(this, options, findOptions);
  }

  async removeInterestsFromPost(post: Post): Promise<void> {
    await this.createQueryBuilder()
        .relation(Post, 'interests')
        .of(post)
        .remove(post.interests);
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
      where: {
        title: Like(`%${title}%`)
      },
      order: {
        title: 'ASC'
      }
    };

    return paginate(this, options, findOptions);
  }
}
