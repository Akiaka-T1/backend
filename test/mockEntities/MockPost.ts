import { BaseEntity } from 'typeorm';
import { User } from '../../src/modules/user/entity/User';
import {Category} from "../../src/modules/category/entity/Category";
import {Interest} from "../../src/modules/interest/entity/Interest";

export class MockPost extends BaseEntity {
    id = 1;
    title = 'Test Post';
    content = 'This is a test post';
    score = 0;
    views = 0;
    thumbnailURL = 'http://example.com/thumbnail.jpg';
    backGroundImgURL  = 'http://example.com/backGround.jpg';
    youtubeURL = 'http://youtube.com/example'
    createdAt = new Date();
    updatedAt = new Date();
    user = jest.fn() as unknown as User;
    category = jest.fn() as unknown as Category;
    interests = [jest.fn() as unknown as Interest];
}