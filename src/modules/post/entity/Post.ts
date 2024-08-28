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
import { PostRecommendation } from '../../recommendation/entity/PostRecommendation';
import {DailyView} from "./Daily";

@Entity('post')
export class Post{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({ length: 255, nullable: true })
  preview: string;

  @Column({ default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  views: number;

  @Column({default: '#1E1F22'})
  backGroundColor: string;

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
  @JoinTable({ name: 'post_interest' })
  interests: Interest[];

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

  @OneToMany(() => PostRecommendation, postRecommendation => postRecommendation.post)
  postRecommendations: PostRecommendation[];

  @OneToMany(() => DailyView, dailyPostView => dailyPostView.post)
  dailyViews: DailyView[];
}
