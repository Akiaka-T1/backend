import { BaseEntity } from 'typeorm';
import {MockUser} from "./MockUser";
import {MockPost} from "./MockPost";

export class MockComment extends BaseEntity {
    id = 1;
    rating = 5;
    comment = 'Test comment';
    user = new MockUser();
    post = new MockPost();
}