import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmService } from './service/AlarmService';
import { AlarmController } from './controller/AlarmController';
import { AlarmRepository } from './repository/AlarmRepository';
import { UserRepository } from '../user/repository/UserRepository'; // UserRepository를 임포트
import { PostRepository } from '../post/repository/PostRepository'; // PostRepository를 임포트
import { UserModule } from '../user/module';
import { CommentModule } from '../comment/module';
import { Alarm } from './entity/Alarm';
import { AlarmSend } from './entity/AlarmSend';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm,AlarmSend, AlarmRepository, UserRepository, PostRepository,]),UserModule,CommentModule,],
  providers: [AlarmService, AlarmRepository],
  controllers: [AlarmController],
  exports: [AlarmService,AlarmRepository],

})
export class AlarmModule {}
