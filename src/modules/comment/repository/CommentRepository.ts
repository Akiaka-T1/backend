import { Injectable } from "@nestjs/common";
import {DataSource, FindManyOptions, FindOptionsWhere, Repository} from "typeorm";
import {Comment} from "../entity/Comment";


@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async findByPostId(postId: number): Promise<Comment[]> {
    const options: FindManyOptions<Comment> = {
      where: { post: { id: postId } } as FindOptionsWhere<Comment>,
      relations: ['user', 'post'],
    };
    return this.find(options);
  }

  async findByUserId(userId: number): Promise<Comment[]> {
    const options: FindManyOptions<Comment> = {
      where: { user: { id: userId } } as FindOptionsWhere<Comment>,
      relations: ['user', 'post'],
    };
    return this.find(options);
  }
  async findById(id: number): Promise<Comment | undefined> {
    return this.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
  }
}