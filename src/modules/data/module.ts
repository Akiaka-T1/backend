import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entity/User";
import { UserService } from "../user/service/UserService";
import {AdminService} from "./admin/AdminService";
import {UserRepository} from "../user/repository/UserRepository";
import {PostService} from "../post/service/PostService";
import {PostRepository} from "../post/repository/PostRepository";
import {CommentService} from "../comment/service/CommentService";
import {CommentRepository} from "../comment/repository/CommentRepository";
import {Post} from "../post/entity/Post";
import {Comment} from "../comment/entity/Comment";
import {CategoryService} from "../category/service/CategoryService";
import {CategoryRepository} from "../category/repository/CategoryRepository";

@Module({
  imports: [TypeOrmModule.forFeature([User,Post,Comment])],
  providers: [
    UserService, UserRepository, AdminService ,
      PostService, PostRepository,
      CommentService, CommentRepository,
      CategoryService, CategoryRepository,
    ],
  exports: [
    UserService,UserRepository,
    PostService,PostRepository,
    CommentService,CommentRepository,
    CategoryService, CategoryRepository,
  ],
})
export class DataModule {}