import { Test, TestingModule } from '@nestjs/testing';
import { InterestService} from "../../dist/modules/interest/service/InterestService";
import { InitInterestService} from "../../dist/modules/data/interest/InitInterestService";
import { InterestRepository} from "../../dist/modules/interest/repository/InterestRepository";
import { PostInterestDto, UpdateInterestDto} from "../../dist/modules/interest/dto/InterestDto";
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../../src/utils/pagination/paginationDto';
import { PaginationResult } from '../../src/utils/pagination/pagination';

const mockInterestRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    paginate: jest.fn(),
});

describe('InterestService', () => {
    let interestService;
    let initInterestService;
    let interestRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterestService,
                InitInterestService,
                { provide: InterestRepository, useFactory: mockInterestRepository },
            ],
        }).compile();

        interestService = module.get<InterestService>(InterestService);
        initInterestService = module.get<InitInterestService>(InitInterestService);
        interestRepository = module.get<InterestRepository>(InterestRepository);

        jest.clearAllMocks();
    });

    describe('onModuleInit', () => {
        it('should initialize interests on module init', async () => {
            const interestNames = ['버럭', '까칠', '기쁨', '소심', '슬픔'];
            interestRepository.findOne.mockResolvedValue(null); // Ensure interests do not exist
            interestRepository.create.mockImplementation(dto => dto);
            interestRepository.save.mockImplementation(dto => Promise.resolve({ id: 1, ...dto }));

            await initInterestService.onModuleInit();

            for (const name of interestNames) {
                expect(interestRepository.findOne).toHaveBeenCalledWith({ where: { name } });
                expect(interestRepository.create).toHaveBeenCalledWith({ name });
                expect(interestRepository.save).toHaveBeenCalledWith({ name });
            }
        });
    });

    describe('post', () => {
        it('should create an interest successfully', async () => {
            interestRepository.create.mockReturnValue({ name: '새로운감정' });
            interestRepository.save.mockResolvedValue({ name: '새로운감정' });

            const postInterestDto: PostInterestDto = {
                name: '새로운감정',
            };

            const result = await interestService.post(postInterestDto);

            expect(interestRepository.create).toHaveBeenCalledWith(postInterestDto);
            expect(interestRepository.save).toHaveBeenCalledWith({ name: '새로운감정' });
            expect(result.name).toEqual('새로운감정');
        });
    });

    describe('findOne', () => {
        it('should find an interest successfully', async () => {
            interestRepository.findById.mockResolvedValue({ id: 1, name: '기쁨' });

            const result = await interestService.findOne(1);

            expect(interestRepository.findById).toHaveBeenCalledWith(1);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('기쁨');
        });

        it('should throw an error if interest is not found', async () => {
            interestRepository.findById.mockResolvedValue(null);

            await expect(interestService.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated interests', async () => {
            const paginationDto: PaginationDto = { page: 1, limit: 10, field: 'id', order: 'ASC' };
            const paginatedResult: PaginationResult<any> = { data: [{ id: 1, name: '기쁨' }], total: 1, page: 1, limit: 10 };

            interestRepository.paginate.mockResolvedValue(paginatedResult);

            const result = await interestService.findAll(paginationDto);

            expect(interestRepository.paginate).toHaveBeenCalledWith(paginationDto);
            expect(result.data[0].id).toEqual(1);
            expect(result.data[0].name).toEqual('기쁨');
        });
    });

    describe('update', () => {
        it('should update an interest successfully', async () => {
            interestRepository.findById.mockResolvedValue({ id: 1, name: '기쁨' });
            interestRepository.save.mockResolvedValue({ id: 1, name: 'Updated Interest' });

            const updateInterestDto: UpdateInterestDto = { name: 'Updated Interest' };

            const result = await interestService.update(1, updateInterestDto);

            expect(interestRepository.findById).toHaveBeenCalledWith(1);
            expect(interestRepository.save).toHaveBeenCalledWith({ id: 1, name: 'Updated Interest' });
            expect(result.name).toEqual('Updated Interest');
        });

        it('should throw an error if interest is not found', async () => {
            interestRepository.findById.mockResolvedValue(null);

            const updateInterestDto: UpdateInterestDto = { name: 'Updated Interest' };

            await expect(interestService.update(1, updateInterestDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interest successfully', async () => {
            interestRepository.findById.mockResolvedValue({ id: 1, name: '기쁨' });
            interestRepository.delete.mockResolvedValue({ affected: 1 });

            await interestService.remove(1);

            expect(interestRepository.findById).toHaveBeenCalledWith(1);
            expect(interestRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw an error if interest is not found', async () => {
            interestRepository.findById.mockResolvedValue(null);

            await expect(interestService.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});
