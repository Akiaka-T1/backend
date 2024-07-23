import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterestRepository} from "../../interest/repository/InterestRepository";
import {defaultInterests} from "../../../constants/defaultInterests";
import {Interest} from "../../interest/entity/Interest";
import {In} from "typeorm";

@Injectable()
export class InitInterestService implements OnModuleInit {
    constructor(
        @InjectRepository(InterestRepository)
        private readonly interestRepository: InterestRepository,
    ) {}

    async onModuleInit() {
        await this.createInitialInterests();
    }

    private async createInitialInterests(): Promise<void> {
        const existingInterests = await this.checkInterestsNotExists(defaultInterests);
        const existingInterestNames = existingInterests.map(interest => interest.name);

        const newInterests = defaultInterests.filter(name => !existingInterestNames.includes(name));

        for (const name of newInterests) {
            const interest = this.interestRepository.create({ name });
            await this.interestRepository.save(interest);
        }
    }

    private async checkInterestsNotExists(names: string[]): Promise<Interest[]> {
        return this.interestRepository.find({ where: { name: In(names) } });
    }
}