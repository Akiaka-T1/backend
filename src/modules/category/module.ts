import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Category} from "./entity/Category";
import {DataModule} from "../data/module";
import {CategoryService} from "./service/CategoryService";
import {CategoryRepository} from "./repository/CategoryRepository";
import {CategoryController} from "./controller/CategoryController";
import {UserCategory} from "./entity/UserCategory";
import {UserCategoryRepository} from "./repository/UserCatrgoryRepository";


@Module({
    imports: [TypeOrmModule.forFeature([Category,UserCategory]),DataModule],
    controllers: [CategoryController],
    providers: [CategoryService,CategoryRepository,UserCategoryRepository],
    exports: [CategoryService, CategoryRepository,UserCategoryRepository],
})
export class CategoryModule {}
