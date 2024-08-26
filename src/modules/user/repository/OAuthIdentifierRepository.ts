import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthIdentifier } from '../entity/OAuthIdentifer';
import { User } from '../entity/User';

@Injectable()
export class OAuthIdentifierRepository {
  constructor(
    @InjectRepository(OAuthIdentifier)
    private readonly repository: Repository<OAuthIdentifier>,
  ) {}

  async findByProviderAndProviderAccountId(provider: string, providerAccountId: string): Promise<OAuthIdentifier | undefined> {
    const oauthId = this.repository.findOne({ where: { provider, providerAccountId }, relations: ['user'] });
    return oauthId;
  }

  async save(oauthIdentifier: OAuthIdentifier): Promise<OAuthIdentifier> {
    return this.repository.save(oauthIdentifier);
  }

  async create(provider: string, providerAccountId: string, user: User): Promise<OAuthIdentifier> {
    const oauthIdentifier = new OAuthIdentifier();
    oauthIdentifier.provider = provider;
    oauthIdentifier.providerAccountId = providerAccountId;
    oauthIdentifier.user = user;

    return this.save(oauthIdentifier);
  }
}
