import {DataSource, Repository} from 'typeorm';
import { UserCategory } from '../entity/UserCategory';
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserCategoryRepository extends Repository<UserCategory> {
    constructor(private dataSource: DataSource) {
        super(UserCategory, dataSource.createEntityManager());
    }
    async findByUserId(userId: number): Promise<UserCategory[]> {
        return this.createQueryBuilder('userCategory')
            .leftJoinAndSelect('userCategory.category', 'category')
            .leftJoin('userCategory.user', 'user')
            .where('userCategory.userId = :userId', { userId })
            .select([
                'userCategory.id',
                'userCategory.views',
                'category.id',
                'category.name'
            ])
            .getMany();
    }

    async deleteUserCategory(userCategoryId: number): Promise<void> {
        await this.delete(userCategoryId);
    }
}
