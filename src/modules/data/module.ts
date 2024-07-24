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
import {UserCategory} from "../category/entity/UserCategory";
import {UserCategoryRepository} from "../category/repository/UserCatrgoryRepository";
import {AuthService} from "../../auth/service/AuthService";
import { Recommendation } from "../recommendation/entity/Recommendation";
import { PostRecommendation } from "../recommendation/entity/PostRecommendation";
import { RecommendationService } from "../recommendation/service/RecommendationService";
import { RecommendationRepository } from "../recommendation/repository/RecommendationRepository";
import { PostRecommendationRepository } from "../recommendation/repository/PostRecommendationRepository";
import { InitRecommendationService } from "./recommendation/InitRecommendationService";
@Module({
  imports: [TypeOrmModule.forFeature([User,Post,Comment,Category,Interest,UserInterest,UserCategory,Recommendation,PostRecommendation])],
  providers: [
    UserService, UserRepository, InitAdminService , AuthService,
      PostService, PostRepository,
      CommentService, CommentRepository,
      CategoryService, CategoryRepository, UserCategoryRepository, InitCategoryService,
      InterestService, InterestRepository,UserInterestRepository, InitInterestService,
      RecommendationService, RecommendationRepository, PostRecommendationRepository, InitRecommendationService 
    ],
  exports: [
    UserService,UserRepository,AuthService,
    PostService,PostRepository,
    CommentService,CommentRepository,
    CategoryService, CategoryRepository,UserCategoryRepository, InitCategoryService,
    InterestService, InterestRepository,UserInterestRepository, InitInterestService, 
    RecommendationService, RecommendationRepository, PostRecommendationRepository, InitRecommendationService
  ],
})
export class DataModule {}