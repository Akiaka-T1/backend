import {UserInterest} from "../entity/UserInterest";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";
import {Interest} from "../entity/Interest";

@Injectable()
export class UserInterestRepository extends Repository<UserInterest> {
    constructor(private dataSource: DataSource) {
        super(UserInterest, dataSource.createEntityManager());
    }

    async updateRatings(userId: number, averageRatings: { interestId: number; averageRating: number | string }[]): Promise<void> {
        const userInterests = await this.createQueryBuilder('user_interest')
            .leftJoinAndSelect('user_interest.interest', 'interest')
            .where('user_interest.user_id = :userId', { userId })
            .select(['user_interest.id', 'user_interest.rating', 'interest.id'])
            .getMany();

        const updates = userInterests.map(ui => {
            const rating = averageRatings.find(r => r.interestId === ui.interest.id)?.averageRating ?? 0;
            ui.rating = typeof rating === "string" ? parseFloat(rating) : rating;
            return ui;
        });

        await this.save(updates);
    }

    async findByUserId(userId: number): Promise<UserInterest[]> {
        return this.createQueryBuilder('user_interest')
            .leftJoinAndSelect('user_interest.interest', 'interest')
            .leftJoin('user_interest.user', 'user')
            .where('user_interest.user_id = :userId', { userId })
            .select([
                'user_interest.id',
                'user_interest.rating',
                'interest.id',
                'interest.name'
            ])
            .getMany();
    }

    async deleteUserInterest(userInterestId: number): Promise<void> {
        await this.delete(userInterestId);
    }
}
