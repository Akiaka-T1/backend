import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { User} from "../../user/entity/User";
import { Category} from "./Category";

@Entity()
export class UserCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.userCategories)
    user: User;

    @ManyToOne(() => Category, category => category.userCategories)
    category: Category;

    @Column({ type: 'int', default: 0 })
    score: number;
}