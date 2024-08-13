import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from 'src/dbConfig/dbconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadYamlConfig } from "./dbConfig/yamlConfig";
import {UserModule} from "./modules/user/module";
import {DataModule} from "./modules/data/module";
import {AlarmModule} from "./modules/alarm/module";
import {AuthModule} from "./auth/module";
import {PostModule} from "./modules/post/module";
import {CommentModule} from "./modules/comment/module";
import {CategoryModule} from "./modules/category/module";
import {InterestModule} from "./modules/interest/module";
import {JwtModule} from "@nestjs/jwt";
import { RecommendationModule } from './modules/recommendation/module';

import {SnakeNamingStrategy} from "typeorm-naming-strategies";


dotenv.config();

const ENV = process.env.NODE_ENV || 'dev';
const configFilePath = `src/dbConfig/${ENV}.yaml`;
const config = loadYamlConfig(configFilePath);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      useFactory: async (configService: ConfigService) => ({
        ...getTypeOrmConfig(configService),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),

      inject: [ConfigService],

    }),
    DataModule,
    UserModule, AuthModule, JwtModule,
    PostModule,
    CommentModule,
    CategoryModule,
    InterestModule, RecommendationModule, AlarmModule
  ],
})
export class AppModule {}