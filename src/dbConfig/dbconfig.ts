import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // yaml 의 'type' 으로 배포/개발 환경 구분
  const dbType = configService.get<'sqlite' | 'mysql'>('db.type');
  const commonOptions = {
    type: dbType,
    database: configService.get<string>('db.database'),
    synchronize: configService.get<boolean>('db.synchronize'),
    logging: configService.get<boolean>('db.logging'),
    entities: [],
    autoLoadEntities: true,
  };
  // 배포환경에서 필요한 추가 설정
  if (dbType === 'mysql') {
    return {
      ...commonOptions,
      host: configService.get<string>('db.host'),
      port: configService.get<number>('db.port'),
      username: configService.get<string>('db.username'),
      password: configService.get<string>('db.password'),
    } as TypeOrmModuleOptions;
  }
  // 개발환경에서 공통 옵션 반환
  else return commonOptions as TypeOrmModuleOptions;
};
