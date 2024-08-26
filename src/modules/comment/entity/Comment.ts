import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/User';
import { Post } from '../../post/entity/Post';

@Entity('comment')
export class Comment{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column({ type: 'integer', default: 0 })
  joyScore: number;

  @Column({ type: 'integer', default: 0 })
  angerScore: number;

  @Column({ type: 'integer', default: 0 })
  irritationScore: number;

  @Column({ type: 'integer', default: 0 })
  fearScore: number;

  @Column({ type: 'integer', default: 0 })
  sadnessScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
