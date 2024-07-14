import { BaseEntity } from 'typeorm';
import { Role } from '../../src/auth/authorization/Role';

export class MockUser extends BaseEntity {
    id = 1;
    name = 'Test User';
    nickname = 'TestNick';
    email = 'test@example.com';
    password = 'password';
    salt = 'salt';
    role = Role.User;
    gender = 'male';
    mbti = 'INTP';
    ageGroup = '20';
    characterId = 1;
    voiceTypeId = 1;
    categoryId = 1;
}
