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

    async findByEmailWithInterestsAndCategories(email: string): Promise<User | undefined> {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userInterests', 'userInterests')
            .leftJoinAndSelect('userInterests.interest', 'interest')
            .leftJoinAndSelect('user.userCategories', 'userCategories')
            .leftJoinAndSelect('userCategories.category', 'category')
            .where('user.email = :email', { email })
            .select([
                'user.id',
                'user.name',
                'user.nickname',
                'userInterests.id',
                'userInterests.rating',
                'interest.id',
                'interest.name',
                'userCategories.id',
                'userCategories.views',
                'category.id',
                'category.name'
            ])
            .getOne();
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
