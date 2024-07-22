import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import {User} from "../../user/entity/User";
import {Interest} from "./Interest";
import {UserAssociation} from "../../user/entity/UserAssociation";

@Entity()
export class UserInterest extends UserAssociation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.userInterests)
    user: User;

    @ManyToOne(() => Interest, interest => interest.userInterests)
    interest: Interest;
}