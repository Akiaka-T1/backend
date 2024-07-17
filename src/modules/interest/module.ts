import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Interest} from "./entity/Interest";
import {DataModule} from "../data/module";
import {InterestService} from "./service/InterestService";
import {InterestRepository} from "./repository/InterestRepository";
import {InterestController} from "./controller/InterestController";
import {UserInterest} from "./entity/UserInterest";
import {UserInterestRepository} from "./repository/UserInterestRepository";


@Module({
    imports: [TypeOrmModule.forFeature([Interest,UserInterest]),DataModule],
    controllers: [InterestController],
    providers: [InterestService,InterestRepository,UserInterestRepository],
    exports: [InterestService, InterestRepository,UserInterestRepository],
})
export class InterestModule {}
