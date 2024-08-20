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

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'recommendation' or 'comment'

  @Column()
  postId: number;

  // @Column({ type: 'varchar', length: 4 })
  // mbti: string;

  @Column({ default: false })
  sendCheck: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
