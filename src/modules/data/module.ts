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
import {UserCategory} from "../category/entity/UserCategory";
import {UserCategoryRepository} from "../category/repository/UserCatrgoryRepository";
import {AuthService} from "../../auth/service/AuthService";
import { Recommendation } from "../recommendation/entity/Recommendation";
import { PostRecommendation } from "../recommendation/entity/PostRecommendation";
import { RecommendationService } from "../recommendation/service/RecommendationService";
import { RecommendationRepository } from "../recommendation/repository/RecommendationRepository";
import { PostRecommendationRepository } from "../recommendation/repository/PostRecommendationRepository";
import {InitDataService} from "./initData/InitDataService";
import {DailyViewRepository} from "../post/repository/DailyViewRepository";
import {DailyView} from "../post/entity/Daily";
@Module({
  imports: [TypeOrmModule.forFeature([User,Post,DailyView,Comment,Category,Interest,UserInterest,UserCategory,Recommendation,PostRecommendation])],
  providers: [
    UserService, UserRepository, InitAdminService , AuthService,
      PostService, PostRepository, DailyViewRepository,
      CommentService, CommentRepository,
      CategoryService, CategoryRepository, UserCategoryRepository,
      InterestService, InterestRepository,UserInterestRepository,
      RecommendationService, RecommendationRepository, PostRecommendationRepository,
      InitDataService
    ],
  exports: [
    UserService,UserRepository,AuthService,
    PostService,PostRepository, DailyViewRepository,
    CommentService,CommentRepository,
    CategoryService, CategoryRepository,UserCategoryRepository,
    InterestService, InterestRepository,UserInterestRepository,
    RecommendationService, RecommendationRepository, PostRecommendationRepository,
    InitDataService
  ],
})
export class DataModule {}