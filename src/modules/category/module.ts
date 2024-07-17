import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Category} from "./entity/Category";
import {DataModule} from "../data/module";
import {CategoryService} from "./service/CategoryService";
import {CategoryRepository} from "./repository/CategoryRepository";
import {CategoryController} from "./controller/CategoryController";


@Module({
    imports: [TypeOrmModule.forFeature([Category]),DataModule],
    controllers: [CategoryController],
    providers: [CategoryService,CategoryRepository],
    exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
