import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {DailyView} from "../entity/Daily";

@Injectable()
export class DailyViewRepository extends Repository<DailyView> {
    constructor(private dataSource: DataSource) {
        super(DailyView, dataSource.createEntityManager());
    }

    async incrementViewCount(postId: number): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dailyPostView = await this.findOne({ where: { post: { id: postId }, date: today } });

        if (dailyPostView) {
            dailyPostView.views++;
        } else {
            dailyPostView = this.create({ post: { id: postId }, views: 1, date: today });
        }

        await this.save(dailyPostView);
    }
}