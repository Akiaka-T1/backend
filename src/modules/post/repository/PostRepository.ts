import { Injectable } from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";
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

  async findByTitle(title: string): Promise<Post | undefined> {
    return this.findOne({ where: { title } });
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
  async calculateAverageRating(postId: number): Promise<string> {
    const result = await this.createQueryBuilder('post')
        .leftJoinAndSelect(Comment, 'comment', 'comment.post_id = post.id')
        .select('AVG(comment.rating)', 'averageRating')
        .where('post.id = :post.id', { postId })
        .getRawOne();

    return parseFloat(result.averageRating).toFixed(1);
  }
}
