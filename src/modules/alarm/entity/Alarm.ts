import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/User';

@Entity('alarm')
export class Alarm {
  @PrimaryGeneratedColumn()
  alarm_id: number;

  @ManyToOne(() => User, (user) => user.alarms, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @Column({ type: 'varchar', length: 50 })  
  type: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;  // 알람클릭시 이동할 url_path

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
