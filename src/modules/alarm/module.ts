import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmService } from './service/AlarmService';
import { AlarmController } from './controller/AlarmController';
import { AlarmRepository } from './repository/AlarmRepository';
import { UserRepository } from '../user/repository/UserRepository'; // UserRepository를 임포트
import { PostRepository } from '../post/repository/PostRepository'; // PostRepository를 임포트
import { UserModule } from '../user/module';

import { Alarm } from './entity/Alarm';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, AlarmRepository, UserRepository, PostRepository]),UserModule,],
  providers: [AlarmService, AlarmRepository],
  controllers: [AlarmController],
  exports: [AlarmService,AlarmRepository],

})
export class AlarmModule {}
