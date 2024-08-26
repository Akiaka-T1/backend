import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import {corsOptions} from "./dbConfig/corsConfig";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors(corsOptions);
  await app.listen(3001);
}
bootstrap();
