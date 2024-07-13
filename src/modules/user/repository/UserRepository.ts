import { Repository, DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<User | undefined> {
        return this.findOne({ where: {id } });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ where: { email } });
    }
}
