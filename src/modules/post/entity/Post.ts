import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, ManyToMany, JoinTable,
} from 'typeorm';
import { User } from '../../user/entity/User';
import { Comment } from '../../comment/entity/Comment';
import {Category} from "../../category/entity/Category";
import {Interest} from "../../interest/entity/Interest";

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  views: number;

  @Column({ length: 255, nullable: true })
  thumbnailURL: string;

  @Column({ length: 255, nullable: true })
  backGroundImgURL: string;

  @Column({ length: 255, nullable: true })
  youtubeURL: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: ['remove'] })
  comments: Comment[];

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @ManyToMany(() => Interest, interest => interest.posts)
  @JoinTable()
  interests: Interest[];
}
