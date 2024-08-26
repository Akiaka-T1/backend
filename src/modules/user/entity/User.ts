import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BaseEntity,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../auth/authorization/Role';
import { Post } from '../../post/entity/Post';
import { Comment } from '../../comment/entity/Comment';
import {UserInterest} from "../../interest/entity/UserInterest";
import {UserCategory} from "../../category/entity/UserCategory";

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  password: string;

  @Column({ type: 'varchar', default: '' })
  salt: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, this.salt);
    }
  }

  @Column({ type: 'varchar', length: 5, default: Role.User })
  role: Role;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'male' })
  gender: string;

  @Column({ type: 'varchar', length: 4, nullable: false, default: 'INTP' })
  mbti: string;

  @Column({ type: 'varchar', length: 2, nullable: false, default: '20' })
  ageGroup: string;

  @Column({ type: 'int', default: 1 })
  characterId: number;

  @Column({ type: 'int', default: 1 })
  voiceTypeId: number;

  @Column({ type: 'int', default: 1 })
  categoryId: number;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: ['remove'] })
  comments: Comment[];

  @OneToMany(() => UserInterest, userInterest => userInterest.user, { cascade: ['remove'] })
  userInterests: UserInterest[];

  @OneToMany(() => UserCategory, userCategory => userCategory.user)
  userCategories: UserCategory[];
}
