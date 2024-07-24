import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";
import { RecommendationCategory } from "../entity/RecommendationCategory";

@Injectable()
export class RecommendationCategoryRepository extends Repository<RecommendationCategory> {
    constructor(private dataSource: DataSource){
        super(RecommendationCategory, dataSource.createEntityManager());
    }

    
}