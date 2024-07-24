import {DataSource, Repository} from 'typeorm';
import { UserCategory } from '../entity/UserCategory';
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserCategoryRepository extends Repository<UserCategory> {
    constructor(private dataSource: DataSource) {
        super(UserCategory, dataSource.createEntityManager());
    }
    async findByUserId(userId: number): Promise<UserCategory[]> {
        return this.createQueryBuilder('user_category')
            .leftJoinAndSelect('user_category.category', 'category')
            .leftJoin('user_category.user', 'user')
            .where('user_category.user_id = :userId', { userId })
            .select([
                'user_category.id',
                'user_category.views',
                'category.id',
                'category.name'
            ])
            .getMany();
    }

    async deleteUserCategory(userCategoryId: number): Promise<void> {
        await this.delete(userCategoryId);
    }
}
