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

@Module({
  imports: [TypeOrmModule.forFeature([User,Post,Comment])],
  providers: [
    UserService, UserRepository, AdminService ,
      PostService, PostRepository,
      CommentService, CommentRepository
    ],
  exports: [
    UserService,UserRepository,
    PostService,PostRepository,
    CommentService,CommentRepository
  ],
})
export class DataModule {}