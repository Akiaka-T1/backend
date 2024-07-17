import {UserInterest} from "../entity/UserInterest";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";

@Injectable()
export class UserInterestRepository extends Repository<UserInterest> {
    constructor(private dataSource: DataSource) {
        super(UserInterest, dataSource.createEntityManager());
    }

    async createUserInterest(userId: number, interestId: number, score: number, name: string): Promise<UserInterest> {
        const userInterest = this.create({ user: { id: userId }, interest: { id: interestId }, score ,name});
        return this.save(userInterest);
    }
    async findByUserId(userId: number): Promise<UserInterest[]> {
        return this.find({
            where: { user: { id: userId } },
            relations: ['interest','user'],
        });
    }

    async deleteUserInterest(userInterestId: number): Promise<void> {
        await this.delete(userInterestId);
    }
}
