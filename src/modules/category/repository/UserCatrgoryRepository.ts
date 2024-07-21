import {DataSource, Repository} from 'typeorm';
import { UserCategory } from '../entity/UserCategory';
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserCategoryRepository extends Repository<UserCategory> {
    constructor(private dataSource: DataSource) {
        super(UserCategory, dataSource.createEntityManager());
    }

    async createUserCategory(userId: number, categoryId: number, score: number, name: string): Promise<UserCategory> {
        const userCategory = this.create({ user: { id: userId }, category: { id: categoryId }, score,name});
        return this.save(userCategory);
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
