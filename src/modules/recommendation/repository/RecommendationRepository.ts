import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Recommendation} from "../entity/Recommendation";

@Injectable()
export class RecommendationRepository extends Repository<Recommendation> {
    constructor(private dataSource: DataSource) {
        super(Recommendation, dataSource.createEntityManager());
    }

    async findByName(name: string): Promise<Recommendation | undefined> {
        return this.findOne({ where: { name } });
    }
}