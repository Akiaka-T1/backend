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
        return this.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ where: { email } });
    }

  async findCharacterByEmail(email: string): Promise<{ characterId: number } | undefined> {
    return this.findOne({
      where: { email },
      select: ['characterId','nickname','role'],
    });
  }

    async findByNickname(nickname: string): Promise<User | undefined> {
        return this.findOne({ where: { nickname } });
    }

    async findByEmailWithInterestsAndCategories(email: string): Promise<User | undefined> {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userInterests', 'user_interests')
            .leftJoinAndSelect('user_interests.interest', 'interest')
            .leftJoinAndSelect('user.userCategories', 'user_categories')
            .leftJoinAndSelect('user_categories.category', 'category')
            .where('user.email = :email', { email })
            .select([
                'user.id',
                'user.name',
                'user.nickname',
                'user_interests.id',
                'user_interests.rating',
                'interest.id',
                'interest.name',
                'user_categories.id',
                'user_categories.views',
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

    async findByIdWithMostInterested(id: number): Promise<string | undefined> {
        const user = await this.findOne({
            where: { id },
            relations: ['userInterests', 'userInterests.interest'],
        });

        if (!user || user.userInterests.length === 0) {
            return undefined;
        }

        const highestRatedInterest = user.userInterests.reduce((max, userInterest) =>
            userInterest.rating > max.rating ? userInterest : max, user.userInterests[0]);

        return highestRatedInterest.interest.name;
    }

    async paginate(options: PaginationOptions): Promise<PaginationResult<User>> {
        return paginate(this, options);
    }
}