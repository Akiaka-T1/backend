import { Injectable } from "@nestjs/common";
import {DataSource, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository} from "typeorm";
import {Comment} from "../entity/Comment";


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

  async findByUserId(userId: number): Promise<Comment[]> {
    return this.createQueryBuilder('comment')
        .innerJoin('comment.user', 'user')
        .innerJoin('comment.post', 'post')
        .where('user.id = :userId', { userId })
        .select(['comment.id', 'comment.comment', 'comment.rating', 'user.id', 'user.nickname', 'post.id', 'post.title'])
        .getMany();
  }

  async findById(id: number): Promise<Comment | undefined> {
    return this.createQueryBuilder('comment')
        .innerJoin('comment.user', 'user')
        .innerJoin('comment.post', 'post')
        .where('comment.id = :id', { id })
        .select(['comment.id', 'comment.comment', 'comment.rating', 'user.id', 'user.nickname', 'post.id', 'post.title'])
        .getOne();
  }

  async findByUserAndPost(userId: number, postId: number): Promise<Comment | undefined> {
    return this.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.post', 'post')
        .where('comment.userId = :userId', { userId })
        .andWhere('comment.postId = :postId', { postId })
        .select(['comment.id'])
        .getOne();
  }
}