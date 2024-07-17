import {UserInterest} from "../entity/UserInterest";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";

@Injectable()
export class UserInterestRepository extends Repository<UserInterest> {
    constructor(private dataSource: DataSource) {
        super(UserInterest, dataSource.createEntityManager());
    }

    async createUserInterest(userId: number, interestId: number, score: number): Promise<UserInterest> {
        const userInterest = this.create({ user: { id: userId }, interest: { id: interestId }, score });
        return this.save(userInterest);
    }

    async deleteUserInterest(userInterestId: number): Promise<void> {
        await this.delete(userInterestId);
    }
}
