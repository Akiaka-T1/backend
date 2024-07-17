import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterestRepository} from "../../interest/repository/InterestRepository";
import { Interest} from "../../interest/entity/Interest";

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
        const interestNames = ['버럭', '까칠', '기쁨', '소심', '슬픔'];

        for (const name of interestNames) {
            if (await this.checkInterestNotExists(name)) {
                const interest = this.interestRepository.create({ name });
                await this.interestRepository.save(interest);
            }
        }
    }

    private async checkInterestNotExists(name: string): Promise<boolean> {
        const interest = await this.interestRepository.findOne({ where: { name } });
        return !interest;
    }
}