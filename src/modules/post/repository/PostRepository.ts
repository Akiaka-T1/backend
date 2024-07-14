import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Post } from "../entity/Post";
import {PaginationResult} from "../../../utils/pagination/pagination";

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
  async findById(id: number): Promise<Post | undefined> {
    return this.findOne({ where: { id }, relations: ['user','movie'] });
  }

  async findByTitle(title: string): Promise<Post | undefined> {
    return this.findOne({ where: { title } });
  }

  async findPaginatedPostsByType(page: number, limit: number, field: string, order: 'ASC' | 'DESC', type: string): Promise<{
    total: number;
    data: Post[]
  }> {
    const [data, total] = await this.createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.movie', 'movie')
        .where('post.type = :type', { type })
        .orderBy(`post.${field}`, order)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    return { data, total };
  }
}
