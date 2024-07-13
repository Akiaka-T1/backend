import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { User } from './entity/User';
import { DataModule } from "../data/module";
import {UserRepository} from "./repository/UserRepository";

@Module({
    imports: [TypeOrmModule.forFeature([User]),DataModule],
    controllers: [UserController],
    providers: [UserService,UserRepository],
    exports: [UserService],
})
export class UserModule {}
