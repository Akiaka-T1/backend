import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../src/modules/post/service/PostService';
import { PostRepository } from '../../src/modules/post/repository/PostRepository';
import { UserService } from '../../src/modules/user/service/UserService';
import { MockPost } from '../mockEntities/MockPost';
import { PostPostDto, UpdatePostDto } from '../../src/modules/post/dto/PostDto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../../src/utils/pagination/paginationDto';
import { PaginationResult } from '../../src/utils/pagination/pagination';
import {MockUser} from "../mockEntities/MockUser";

const mockPostRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    paginate: jest.fn(),
});

const mockUserService = () => ({
    findById: jest.fn(),
});

describe('PostService', () => {
    let postService;
    let postRepository;
    let userService;
    let mockPost;
    let mockUser;

    beforeEach(async () => {
        mockPost = new MockPost();
        mockUser = new MockUser();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                { provide: PostRepository, useFactory: mockPostRepository },
                { provide: UserService, useFactory: mockUserService },
            ],
        }).compile();

        postService = module.get<PostService>(PostService);
        postRepository = module.get<PostRepository>(PostRepository);
        userService = module.get<UserService>(UserService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a post successfully', async () => {
            userService.findById.mockResolvedValue(mockPost.user);
            postRepository.create.mockReturnValue(mockPost);
            postRepository.save.mockResolvedValue(mockPost);

            const postPostDto: PostPostDto = {
                title: 'Test Post',
                content: 'This is a test post',
                thumbnailURL: 'http://example.com/thumbnail.jpg',
            };
            const result = await postService.create(postPostDto, 1);

            expect(userService.findById).toHaveBeenCalledWith(1);
            expect(postRepository.create).toHaveBeenCalledWith({
                ...postPostDto,
                user: mockPost.user,
            });
            expect(postRepository.save).toHaveBeenCalledWith(mockPost);

            expect(result.id).toEqual(1);
            expect(result.title).toEqual('Test Post');
            expect(result.content).toEqual('This is a test post');
        });
    });

    describe('findOne', () => {
        it('should find a post successfully', async () => {
            postRepository.findById.mockResolvedValue(mockPost);
            postRepository.save.mockResolvedValue(mockPost);

            const result = await postService.findOne(1);

            expect(postRepository.findById).toHaveBeenCalledWith(1);
            expect(result.id).toEqual(1);
            expect(result.title).toEqual('Test Post');
            expect(result.content).toEqual('This is a test post');
        });

        it('should throw an error if post is not found', async () => {
            postRepository.findById.mockResolvedValue(null);

            await expect(postService.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated posts', async () => {
            const paginationDto: PaginationDto = { page: 1, limit: 10, field: 'id', order: 'ASC' };
            const paginatedResult: PaginationResult<MockPost> = { data: [mockPost], total: 1, page: 1, limit: 10 };

            postRepository.paginate.mockResolvedValue(paginatedResult);

            const result = await postService.findAll(paginationDto);

            expect(postRepository.paginate).toHaveBeenCalledWith(paginationDto);
            expect(result.data[0].id).toEqual(1);
            expect(result.data[0].title).toEqual('Test Post');
            expect(result.data[0].content).toEqual('This is a test post');
        });
    });

    describe('update', () => {
        it('should update a post successfully', async () => {
            postRepository.findById.mockResolvedValue(mockPost);
            postRepository.save.mockResolvedValue(mockPost);

            const updatePostDto: UpdatePostDto = { title: 'Updated Post' };

            const result = await postService.update(1, updatePostDto, mockPost.user);

            expect(postRepository.findById).toHaveBeenCalledWith(1);
            expect(postRepository.save).toHaveBeenCalledWith({ ...mockPost, ...updatePostDto });
            expect(result.title).toEqual('Updated Post');
        });

        it('should throw an error if post is not found', async () => {
            postRepository.findById.mockResolvedValue(null);

            const updatePostDto: UpdatePostDto = { title: 'Updated Post' };

            await expect(postService.update(1, updatePostDto, mockPost.user)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a post successfully', async () => {
            postRepository.findById.mockResolvedValue(mockPost);
            postRepository.delete.mockResolvedValue({ affected: 1 });

            await postService.remove(1);

            expect(postRepository.findById).toHaveBeenCalledWith(1);
            expect(postRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw an error if post is not found', async () => {
            postRepository.findById.mockResolvedValue(null);

            await expect(postService.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});
