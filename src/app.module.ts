import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from 'src/dbConfig/dbconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadYamlConfig } from "./dbConfig/yamlConfig";

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
  ],
})
export class AppModule {}