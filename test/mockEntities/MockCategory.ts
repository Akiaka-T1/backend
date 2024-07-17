import { BaseEntity } from 'typeorm';
import { Post } from '../../src/modules/post/entity/Post';

export class MockCategory extends BaseEntity {
    id = 1;
    name = 'Test Category';
    description = 'This is a test category';
    posts = [jest.fn() as unknown as Post];
}