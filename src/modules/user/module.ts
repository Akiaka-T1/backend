import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { User } from './entity/User';
import { AlarmService } from '../alarm/service/AlarmService';
import { AlarmRepository } from '../alarm/repository/AlarmRepository';
import { DataModule } from "../data/module";
import {UserRepository} from "./repository/UserRepository";

@Module({
    imports: [TypeOrmModule.forFeature([User, UserRepository, AlarmRepository,]),DataModule],
    controllers: [UserController],
    providers: [UserService,UserRepository,AlarmService],
    exports: [UserService,UserRepository],
})
export class UserModule {}
