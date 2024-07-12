import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from 'config/dbconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadYamlConfig } from "../config/yamlConfig";

dotenv.config();

const ENV = process.env.NODE_ENV || 'dev';
const configFilePath = `config/${ENV}.yaml`;
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
      ]
})
export class AppModule {}
