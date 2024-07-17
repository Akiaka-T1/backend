import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from 'src/dbConfig/dbconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadYamlConfig } from "./dbConfig/yamlConfig";
import {UserModule} from "./modules/user/module";
import {DataModule} from "./modules/data/module";
import {AuthModule} from "./auth/module";
import {PostModule} from "./modules/post/module";
import {CommentModule} from "./modules/comment/module";
import {CategoryModule} from "./modules/category/module";
import {InterestModule} from "./modules/interest/module";

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
      }),

      inject: [ConfigService],
    }),
    DataModule,
    UserModule, AuthModule,
    PostModule,
    CommentModule,
    CategoryModule,
    InterestModule

  ],
})
export class AppModule {}