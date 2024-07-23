import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './service/CommentService';
import { CommentController } from './controller/CommentController';
import { Comment } from './entity/Comment';
import { CommentRepository } from "./repository/CommentRepository";
import {DataModule} from "../data/module";
import {UserModule} from "../user/module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), DataModule],
  controllers: [CommentController],
  providers: [CommentService,CommentRepository],
  exports: [CommentService,CommentRepository],
})
export class CommentModule {}