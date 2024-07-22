import {DataSource, Repository} from 'typeorm';
import { UserCategory } from '../entity/UserCategory';
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserCategoryRepository extends Repository<UserCategory> {
    constructor(private dataSource: DataSource) {
        super(UserCategory, dataSource.createEntityManager());
    }
    async findByUserId(userId: number): Promise<UserCategory[]> {
        return this.find({
            where: { user: { id: userId } },
            relations: ['category','user'],
        });
    }

    async deleteUserCategory(userCategoryId: number): Promise<void> {
        await this.delete(userCategoryId);
    }
}
