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
    return this.findOne({ where: { id }, relations: ['user'] });
  }

  async findByIdWithSelectedFields(id: number): Promise<Post | undefined> {
    return this.createQueryBuilder('post')
        .where('post.id = :id', { id })
        .select(['post.id', 'post.title'])
        .getOne();
  }

  async findByTitle(title: string): Promise<Post | undefined> {
    return this.findOne({ where: { title } });
  }
  async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Post>): Promise<PaginationResult<Post>> {
    return paginate(this, options, findOptions);
  }
}
