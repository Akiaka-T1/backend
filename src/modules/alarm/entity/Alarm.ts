import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/User';
import { Post } from '../../post/entity/Post'; // Post 엔티티를 가져옵니다.

@Entity('alarm')
export class Alarm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'recommendation' or 'comment'

  // @Column()
  // postId: number;
  // Post와 ManyToOne 관계 설정
  @ManyToOne(() => Post, (post) => post.alarms, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ default: false })
  sendCheck: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
