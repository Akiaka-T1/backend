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
  id: number;

  @Column()
  postId: number;

  @Column({ type: 'varchar', length: 255 })
  message: string; //추천알림인지 댓글알림인지

  @Column({ type: 'varchar', length: 50 })  
  type: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;  // 알람클릭시 이동할 url_path

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
