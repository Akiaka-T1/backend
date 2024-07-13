import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entity/User";
import { UserService } from "../user/service/UserService";
import {AdminService} from "./admin/AdminService";
import {UserRepository} from "../user/repository/UserRepository";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService, UserRepository, AdminService
    ],
  exports: [
    UserService
  ],
})
export class DataModule {}