import { Injectable } from "@nestjs/common";
import {DataSource, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository} from "typeorm";
import {Comment} from "../entity/Comment";
import {
  PaginationOptions,
  PaginationResult,
  paginate,
  paginateWithQueryBuilder
} from "../../../utils/pagination/pagination";


@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

    async findByPostId(postId: number): Promise<Comment[]> {
        return this.createQueryBuilder('comment')
            .innerJoin('comment.user', 'user')
            .innerJoin('comment.post', 'post')
            .where('post.id = :postId', { postId })
            .select(['comment.id', 'comment.comment', 'comment.rating', 'user.id', 'user.nickname', 'post.id', 'post.title'])
            .getMany();
    }

    async findByUserId(userId: number, paginationOptions: PaginationOptions): Promise<PaginationResult<Comment>> {
        const queryBuilder = this.createQueryBuilder('comment')
            .innerJoinAndSelect('comment.user', 'user')
            .innerJoinAndSelect('comment.post', 'post')
            .where('user.id = :userId', { userId });

        return paginateWithQueryBuilder(queryBuilder, paginationOptions);
    }

    async findById(id: number): Promise<Comment | undefined> {
        return this.createQueryBuilder('comment')
            .innerJoinAndSelect('comment.user', 'user')
            .innerJoinAndSelect('comment.post', 'post')
            .leftJoinAndSelect('post.interests', 'interests')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.userInterests', 'user_interests')
            .leftJoinAndSelect('user.userCategories', 'user_categories')
            .where('comment.id = :id', { id })
            .getOne();
    }

    async findByUserAndPost(userId: number, postId: number): Promise<Comment | undefined> {
        return this.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.post', 'post')
            .where('comment.user_id = :userId', { userId })
            .andWhere('comment.post_id = :postId', { postId })
            .select(['comment.id'])
            .getOne();
    }

    async getAverageRatingsByUserId(userId: number): Promise<{ interestId: number; averageRating: number }[]> {
        return this.createQueryBuilder('comment')
            .leftJoin('comment.user', 'user')
            .leftJoin('comment.post', 'post')
            .leftJoin('post.interests', 'interest')
            .select(['interest.id AS interestId', 'AVG(comment.rating) AS averageRating'])
            .where('user.id = :userId', { userId })
            .groupBy('interest.id')
            .getRawMany();
    }

    async updatePostAverageRating(postId: number) {
        const result = await this
            .createQueryBuilder('comment')
            .select('AVG(comment.rating)', 'averageRating')
            .where('comment.post.id = :postId', { postId })
            .setParameter('postId', postId)
            .execute();
    }

  async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Comment>): Promise<PaginationResult<Comment>> {
    return paginate(this, options, findOptions);
  }
}