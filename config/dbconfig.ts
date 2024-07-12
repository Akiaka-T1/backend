import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';


export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbType = configService.get<'sqlite' | 'mysql'>('db.type');
  const commonOptions = {
    type: dbType,
    database: configService.get<string>('db.database'),
    synchronize: configService.get<boolean>('db.synchronize'),
    logging: configService.get<boolean>('db.logging'),
    entities: [],
    autoLoadEntities: true,
  };

  if (dbType === 'mysql') {
    return {
      ...commonOptions,
      host: configService.get<string>('db.host'),
      port: configService.get<number>('db.port'),
      username: configService.get<string>('db.username'),
      password: configService.get<string>('db.password'),
    } as TypeOrmModuleOptions;
  }

  return commonOptions as TypeOrmModuleOptions;
};
