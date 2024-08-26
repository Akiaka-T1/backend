import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from "./entity/Post";
import { PostController } from "./controller/PostController";
import { PostService } from "./service/PostService";
import { PostRepository } from "./repository/PostRepository";
import { DataModule } from "../data/module";
import {DailyView} from "./entity/Daily";
import {DailyViewRepository} from "./repository/DailyViewRepository";

@Module({
  imports: [TypeOrmModule.forFeature([Post,DailyView]),DataModule],
  controllers: [PostController],
  providers: [PostService,PostRepository,DailyViewRepository],
  exports: [PostService, PostRepository,DailyViewRepository],
})
export class PostModule {}
