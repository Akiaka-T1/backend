import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {RecommendationCategory} from './RecommendationCategory';

@Entity()
export class Recommendation {
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(()=>RecommendationCategory, category => category.recommendations)
    category: RecommendationCategory;

    @Column({ type: 'varchar', length: 20, nullable: false })
    name: string;
    
    @Column({ type: 'varchar', length: 100, nullable: true })
    description: string;

}