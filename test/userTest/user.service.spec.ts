import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/modules/user/service/UserService';
import { UserRepository } from '../../src/modules/user/repository/UserRepository';
import { MockUser } from '../mockEntities/MockUser';
import { PostUserDto, UpdateUserDto } from '../../src/modules/user/dto/UserDto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../../src/utils/pagination/paginationDto';
import { PaginationResult } from '../../src/utils/pagination/pagination';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
  paginate: jest.fn(),
});

describe('UserService', () => {
  let userService;
  let userRepository;
  let mockUser;

  beforeEach(async () => {
    mockUser = new MockUser();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const postUserDto: PostUserDto = {
        name: 'Test User',
        nickname: 'TestNick',
        email: 'test@example.com',
        password: 'password',
        gender: 'male',
        ageGroup: '20',
        mbti: 'INTP',
        characterId: 1,
        voiceTypeId: 1,
        categoryId: 1,
      };

      const result = await userService.create(postUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(userRepository.create).toHaveBeenCalledWith(postUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);

      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Test User');
      expect(result.email).toEqual('test@example.com');
    });

    it('should throw an error if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const postUserDto: PostUserDto = {
        name: 'Test User',
        nickname: 'TestNick',
        email: 'test@example.com',
        password: 'password',
        gender: 'male',
        ageGroup: '20',
        mbti: 'INTP',
        characterId: 1,
        voiceTypeId: 1,
        categoryId: 1,
      };

      await expect(userService.create(postUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should find a user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Test User');
      expect(result.email).toEqual('test@example.com');
    });

    it('should throw an error if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, field: 'id', order: 'ASC' };
      const paginatedResult: PaginationResult<MockUser> = { data: [mockUser], total: 1, page: 1, limit: 10 };

      userRepository.paginate.mockResolvedValue(paginatedResult);

      const result = await userService.findAll(paginationDto);

      expect(userRepository.paginate).toHaveBeenCalledWith(paginationDto);
      expect(result.data[0].id).toEqual(1);
      expect(result.data[0].name).toEqual('Test User');
      expect(result.data[0].email).toEqual('test@example.com');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, nickname: 'UpdatedNick' };
      userRepository.save.mockResolvedValue(updatedUser);

      const updateUserDto: UpdateUserDto = { nickname: 'UpdatedNick' };

      const result = await userService.update(1, updateUserDto);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        nickname: 'UpdatedNick',
        email: 'test@example.com',
        gender: 'male',
        ageGroup: '20',
        mbti: 'INTP',
        characterId: 1,
        voiceTypeId: 1,
        categoryId: 1,
        role:"user"
      });
    });

    it('should throw an error if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const updateUserDto: UpdateUserDto = { nickname: 'UpdatedNick' };

      await expect(userService.update(1, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue({ affected: 1 });

      await userService.remove(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
