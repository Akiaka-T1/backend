import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from "typeorm";
import { User } from "./User"

@Entity()
export class OAuthIdentifier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string;

  @Column()
  providerAccountId: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;
}
