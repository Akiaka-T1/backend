import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmService } from './service/AlarmService';
import { AlarmController } from './controller/AlarmController';
import { AlarmRepository } from './repository/AlarmRepository';
import { UserModule } from '../user/module';
import { CommentModule } from '../comment/module';
import { Alarm } from './entity/Alarm';
import { AlarmSend } from './entity/AlarmSend';
import { DataModule } from '../data/module';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm,AlarmSend]),UserModule,CommentModule,DataModule],
  controllers: [AlarmController],
  providers: [AlarmService,AlarmRepository],
  exports: [AlarmService,AlarmRepository],
})
export class AlarmModule {}
