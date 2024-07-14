import { Repository, DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Injectable } from '@nestjs/common';
import {PaginationResult,PaginationOptions,paginate} from "../../../utils/pagination/pagination";


@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<User | undefined> {
        return this.findOne({ where: {id } });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ where: { email } });
    }

    async findByEmailWithSelectedFields(email: string): Promise<User | undefined> {
        return this.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .select(['user.id', 'user.nickname'])
            .getOne();
    }
    async paginate(options: PaginationOptions): Promise<PaginationResult<User>> {
        return paginate(this, options);
    }
}
