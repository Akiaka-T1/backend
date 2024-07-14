import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from "./entity/Post";
import { PostController } from "./controller/PostController";
import { PostService } from "./service/PostService";
import { PostRepository } from "./repository/PostRepository";
import { DataModule } from "../data/module";

@Module({
  imports: [TypeOrmModule.forFeature([Post]),DataModule],
  controllers: [PostController],
  providers: [PostService,PostRepository],
  exports: [PostService, PostRepository],
})
export class PostModule {}
