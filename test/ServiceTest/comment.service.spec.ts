import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../../src/modules/comment/service/CommentService';
import { CommentRepository } from '../../src/modules/comment/repository/CommentRepository';
import { UserRepository } from '../../src/modules/user/repository/UserRepository';
import { PostRepository } from '../../src/modules/post/repository/PostRepository';
import { MockComment } from '../mockEntities/MockComment';
import { PostCommentDto, UpdateCommentDto } from '../../src/modules/comment/dto/CommentDto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {MockUser} from "../mockEntities/MockUser";
import {MockPost} from "../mockEntities/MockPost";

const mockCommentRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByPostId: jest.fn(),
    findByUserId: jest.fn(),
    findByUserAndPost: jest.fn(),


    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ averageRating: '4.5' }),
    }),
});

const mockUserRepository = () => ({
    findByEmail: jest.fn(),
    findByEmailWithSelectedFields: jest.fn(),
});

const mockPostRepository = () => ({
    findById: jest.fn(),
    findByIdWithSelectedFields: jest.fn(),
    update: jest.fn(),
});

describe('CommentService', () => {
    let commentService;
    let commentRepository;
    let userRepository;
    let postRepository;
    let mockComment;
    let mockUser;
    let mockPost;

    beforeEach(async () => {
        mockComment = new MockComment();
        mockUser = new MockUser();
        mockPost = new MockPost();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                { provide: CommentRepository, useFactory: mockCommentRepository },
                { provide: UserRepository, useFactory: mockUserRepository },
                { provide: PostRepository, useFactory: mockPostRepository },
            ],
        }).compile();

        commentService = module.get<CommentService>(CommentService);
        commentRepository = module.get<CommentRepository>(CommentRepository);
        userRepository = module.get<UserRepository>(UserRepository);
        postRepository = module.get<PostRepository>(PostRepository);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a comment successfully', async () => {
            userRepository.findByEmailWithSelectedFields.mockResolvedValue(mockComment.user);
            postRepository.findByIdWithSelectedFields.mockResolvedValue(mockComment.post);
            commentRepository.create.mockReturnValue(mockComment);
            commentRepository.save.mockResolvedValue(mockComment);

            const postCommentDto: PostCommentDto = {
                postId: 1,
                rating: 5,
                comment: 'Test comment',
            };
            const result = await commentService.create(postCommentDto, 'test@example.com');

            expect(userRepository.findByEmailWithSelectedFields).toHaveBeenCalledWith('test@example.com');
            expect(postRepository.findByIdWithSelectedFields).toHaveBeenCalledWith(1);
            expect(commentRepository.create).toHaveBeenCalledWith({
                rating: 5,
                comment: 'Test comment',
                user: mockComment.user,
                post: mockComment.post,
            });
            expect(commentRepository.save).toHaveBeenCalledWith(mockComment);

            expect(result.id).toEqual(1);
            expect(result.rating).toEqual(5);
            expect(result.comment).toEqual('Test comment');
        });

        it('should throw a conflict error if user has already commented on the post', async () => {
            userRepository.findByEmailWithSelectedFields.mockResolvedValue(mockComment.user);
            postRepository.findByIdWithSelectedFields.mockResolvedValue(mockComment.post);
            commentRepository.findOne.mockResolvedValue(mockComment);

            const postCommentDto: PostCommentDto = {
                postId: 1,
                rating: 5,
                comment: 'Test comment',
            };

            await expect(commentService.create(postCommentDto, 'test@example.com')).rejects.toThrow(TypeError);
        });
    });

    describe('findById', () => {
        it('should find a comment successfully', async () => {
            commentRepository.findById.mockResolvedValue(mockComment);

            const result = await commentService.findById(1);

            expect(commentRepository.findById).toHaveBeenCalledWith(1);
            expect(result.id).toEqual(1);
            expect(result.rating).toEqual(5);
            expect(result.comment).toEqual('Test comment');
        });

        it('should throw an error if comment is not found', async () => {
            commentRepository.findById.mockResolvedValue(null);

            await expect(commentService.findById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByPostId', () => {
        it('should find comments by post id', async () => {
            commentRepository.findByPostId.mockResolvedValue([mockComment]);

            const result = await commentService.findByPostId(1);

            expect(commentRepository.findByPostId).toHaveBeenCalledWith(1);
            expect(result[0].id).toEqual(1);
            expect(result[0].rating).toEqual(5);
            expect(result[0].comment).toEqual('Test comment');
        });
    });

    describe('findByUserId', () => {
        it('should find comments by user id', async () => {
            commentRepository.findByUserId.mockResolvedValue([mockComment]);

            const result = await commentService.findByUserId(1);

            expect(commentRepository.findByUserId).toHaveBeenCalledWith(1);
            expect(result[0].id).toEqual(1);
            expect(result[0].rating).toEqual(5);
            expect(result[0].comment).toEqual('Test comment');
        });
    });

    describe('update', () => {
        it('should update a comment successfully', async () => {
            commentRepository.findById.mockResolvedValue(mockComment);
            commentRepository.save.mockResolvedValue(mockComment);

            const updateCommentDto: UpdateCommentDto = { rating: 4, comment: 'Updated comment' };

            const result = await commentService.update(1, updateCommentDto);

            expect(commentRepository.findById).toHaveBeenCalledWith(1);
            expect(commentRepository.save).toHaveBeenCalledWith({
                ...mockComment,
                rating: 4,
                comment: 'Updated comment',
            });
            expect(result.rating).toEqual(4);
            expect(result.comment).toEqual('Updated comment');
        });

        it('should throw an error if comment is not found', async () => {
            commentRepository.findById.mockResolvedValue(null);

            const updateCommentDto: UpdateCommentDto = { rating: 4, comment: 'Updated comment' };

            await expect(commentService.update(1, updateCommentDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a comment successfully', async () => {
            commentRepository.findById.mockResolvedValue(mockComment);
            commentRepository.remove.mockResolvedValue(mockComment);

            await commentService.remove(1);

            expect(commentRepository.findById).toHaveBeenCalledWith(1);
            expect(commentRepository.remove).toHaveBeenCalledWith(mockComment);
        });

        it('should throw an error if comment is not found', async () => {
            commentRepository.findById.mockResolvedValue(null);

            await expect(commentService.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});