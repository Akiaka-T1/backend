import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entity/User";
import { UserService } from "../user/service/UserService";
import {AdminService} from "./admin/AdminService";
import {UserRepository} from "../user/repository/UserRepository";
import {PostService} from "../post/service/PostService";
import {PostRepository} from "../post/repository/PostRepository";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService, UserRepository, AdminService ,
      PostService, PostRepository
    ],
  exports: [
    UserService, PostService
  ],
})
export class DataModule {}