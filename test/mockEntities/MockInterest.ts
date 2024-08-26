import {Post} from "../../src/modules/post/entity/Post";
import {UserInterest} from "../../src/modules/interest/entity/UserInterest";

export class MockInterest  {
    id = 1;
    name = 'Test Interest';
    posts = [jest.fn() as unknown as Post];
    userInterests = [jest.fn() as unknown as UserInterest];
}