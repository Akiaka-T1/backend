import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entity/User";
import { UserService } from "../user/service/UserService";
import {InitAdminService} from "./admin/InitAdminService";
import {UserRepository} from "../user/repository/UserRepository";
import {PostService} from "../post/service/PostService";
import {PostRepository} from "../post/repository/PostRepository";
import {CommentService} from "../comment/service/CommentService";
import {CommentRepository} from "../comment/repository/CommentRepository";
import {Post} from "../post/entity/Post";
import {Comment} from "../comment/entity/Comment";
import {CategoryService} from "../category/service/CategoryService";
import {CategoryRepository} from "../category/repository/CategoryRepository";
import {InterestService} from "../interest/service/InterestService";
import {InterestRepository} from "../interest/repository/InterestRepository";
import {UserInterestRepository} from "../interest/repository/UserInterestRepository";
import {Category} from "../category/entity/Category";
import {UserInterest} from "../interest/entity/UserInterest";
import {Interest} from "../interest/entity/Interest";
import {InitInterestService} from "./interest/InitInterestService"
import {InitCategoryService} from "./category/InitCategoryService";

@Module({
  imports: [TypeOrmModule.forFeature([User,Post,Comment,Category,Interest,UserInterest])],
  providers: [
    UserService, UserRepository, InitAdminService ,
      PostService, PostRepository,
      CommentService, CommentRepository,
      CategoryService, CategoryRepository, InitCategoryService,
      InterestService, InterestRepository,UserInterestRepository, InitInterestService
    ],
  exports: [
    UserService,UserRepository,
    PostService,PostRepository,
    CommentService,CommentRepository,
    CategoryService, CategoryRepository, InitCategoryService,
    InterestService, InterestRepository,UserInterestRepository
  ],
})
export class DataModule {}