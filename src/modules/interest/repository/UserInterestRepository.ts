import {UserInterest} from "../entity/UserInterest";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";

@Injectable()
export class UserInterestRepository extends Repository<UserInterest> {
    constructor(private dataSource: DataSource) {
        super(UserInterest, dataSource.createEntityManager());
    }

    async updateRating(userInterest: UserInterest): Promise<void> {
        const result = await this.createQueryBuilder('userInterest')
            .leftJoin('userInterest.user', 'user')
            .leftJoin('userInterest.interest', 'interest')
            .leftJoin('user.comments', 'comment')
            .leftJoin('comment.post', 'post')
            .leftJoin('post.interests', 'postInterest')
            .where('userInterest.id = :id', { id: userInterest.id })
            .andWhere('postInterest.id = interest.id')
            .select('AVG(comment.rating)', 'averageRating')
            .getRawOne();

        let averageRating = parseFloat(result.averageRating);
        if (isNaN(averageRating)) averageRating = 0;
        userInterest.rating = averageRating;

        await this.save(userInterest);
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
