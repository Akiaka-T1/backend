import { Injectable } from "@nestjs/common";
import { DataSource, FindManyOptions, Repository } from "typeorm";
import { Recommendation } from "../entity/recommendation";
@Injectable()
export class RecommendationRepository extends Repository<Recommendation> {
    constructor(private dataSource: DataSource){
        super(Recommendation, dataSource.createEntityManager());
    }
}