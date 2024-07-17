import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import {User} from "../../user/entity/User";
import {Interest} from "./Interest";

@Entity()
export class UserInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.userInterests)
    user: User;

    @ManyToOne(() => Interest, interest => interest.userInterests)
    interest: Interest;

    @Column({ type: 'int', default: 0 })
    score: number;
}
