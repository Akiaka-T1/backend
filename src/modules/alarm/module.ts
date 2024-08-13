import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmService } from './service/AlarmService';
import { AlarmController } from './controller/AlarmController';
import { AlarmRepository } from './repository/AlarmRepository';
import { Alarm } from './entity/Alarm';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm])],
  providers: [AlarmService, AlarmRepository],
  controllers: [AlarmController],
})
export class AlarmModule {}
