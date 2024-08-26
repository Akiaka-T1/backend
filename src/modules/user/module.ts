import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { User } from './entity/User';
import { DataModule } from "../data/module";
import {UserRepository} from "./repository/UserRepository";
import { OAuthIdentifier } from "./entity/OAuthIdentifer";
import { OAuthIdentifierRepository } from "./repository/OAuthIdentifierRepository";

@Module({
    imports: [TypeOrmModule.forFeature([User,OAuthIdentifier]),DataModule],
    controllers: [UserController],
    providers: [UserService,UserRepository,OAuthIdentifierRepository],
    exports: [UserService,UserRepository,OAuthIdentifierRepository],
})
export class UserModule {}
