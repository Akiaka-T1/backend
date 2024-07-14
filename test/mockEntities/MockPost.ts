import { BaseEntity } from 'typeorm';
import { User } from '../../src/modules/user/entity/User';

export class MockPost extends BaseEntity {
    id = 1;
    title = 'Test Post';
    content = 'This is a test post';
    score = 0;
    views = 0;
    thumbnailURL = 'http://example.com/thumbnail.jpg';
    createdAt = new Date();
    updatedAt = new Date();
    user = { id: 1, email: 'test@example.com' } as User;
}