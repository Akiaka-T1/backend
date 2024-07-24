import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {Recommendation} from './Recommendation';

@Entity()
export class RecommendationCategory{
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type: 'varchar', length: 20, nullable:false})
    name: string;

    @Column({ type: 'varchar', length: 100, nullable:true})
    description: string;

    @OneToMany(() => Recommendation, recommendation => recommendation.category)
    recommendations: Recommendation[];

}