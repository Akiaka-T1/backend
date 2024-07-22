import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { User} from "../../user/entity/User";
import { Category} from "./Category";
import {UserAssociation} from "../../user/entity/UserAssociation";

@Entity()
export class UserCategory extends UserAssociation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.userCategories)
    user: User;

    @ManyToOne(() => Category, category => category.userCategories)
    category: Category;
}