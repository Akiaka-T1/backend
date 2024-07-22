import { Column } from 'typeorm';

export abstract class UserAssociation {
    @Column({ type: 'int', default: 0 })
    score: number;

    @Column({ nullable: true })
    name: string;

}
