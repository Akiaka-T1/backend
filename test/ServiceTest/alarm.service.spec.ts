import { Test, TestingModule } from '@nestjs/testing';
import { AlarmService } from '../../src/modules/alarm/service/AlarmService';  
import { AlarmRepository } from '../../src/modules/alarm/repository/AlarmRepository';  
import { UserRepository } from '../../src/modules/user/repository/UserRepository';  
import { CommentRepository } from '../../src/modules/comment/repository/CommentRepository'; 
import { MockAlarm, MockAlarmSend } from '../mockEntities/MockAlarm';  
import { MockUser } from '../mockEntities/MockUser';  
import { MockComment } from '../mockEntities/MockComment';  

const mockAlarmRepository = () => ({
    createAlarm: jest.fn(),
    createAlarmSend: jest.fn(),
    findUnreadAlarms: jest.fn(),
    markAlarmAsConsumed: jest.fn(),
});

const mockUserRepository = () => ({
    findOne: jest.fn(),
});

const mockCommentRepository = () => ({
    findCommentsByPostId: jest.fn(),
});

describe('AlarmService', () => {
    let service: AlarmService;
    let alarmRepository;
    let userRepository;
    let commentRepository;

    beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
        AlarmService,
        { provide: AlarmRepository, useFactory: mockAlarmRepository },
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: CommentRepository, useFactory: mockCommentRepository },
        ],
    }).compile();

    service = module.get<AlarmService>(AlarmService);
    alarmRepository = module.get<AlarmRepository>(AlarmRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    commentRepository = module.get<CommentRepository>(CommentRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAndSendAlarms', () => {
    it('should create and send alarms to related users', async () => {
        const postId = 1;
        const userIds = [1, 2, 3];
        const user = new MockUser();
        const alarm = new MockAlarm();
        const alarmSend = new MockAlarmSend();

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
        jest.spyOn(alarmRepository, 'createAlarm').mockResolvedValue(alarm);
        jest.spyOn(alarmRepository, 'createAlarmSend').mockResolvedValue(alarmSend);

        await service.createAndSendAlarms(postId, userIds);

        expect(userRepository.findOne).toHaveBeenCalledTimes(userIds.length);
        expect(alarmRepository.createAlarm).toHaveBeenCalledTimes(userIds.length);
        expect(alarmRepository.createAlarmSend).toHaveBeenCalledTimes(userIds.length);
    });

    it('should log an error if user is not found', async () => {
        const postId = 1;
        const userIds = [1];
    
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await service.createAndSendAlarms(postId, userIds);

        expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(alarmRepository.createAlarm).not.toHaveBeenCalled();
        expect(alarmRepository.createAlarmSend).not.toHaveBeenCalled();
    });
    });

    describe('sendUnsentAlarms', () => {
    it('should find unread alarms and send them', async () => {
        const alarm = new MockAlarm();
        const comment = new MockComment();
        comment.user = new MockUser();
        const user = new MockUser();
        const alarmSend = new MockAlarmSend();

        jest.spyOn(alarmRepository, 'findUnreadAlarms').mockResolvedValue([alarm]);
        jest.spyOn(commentRepository, 'findCommentsByPostId').mockResolvedValue([comment]);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
        jest.spyOn(alarmRepository, 'createAlarmSend').mockResolvedValue(alarmSend);

        await service.sendUnsentAlarms();

        expect(alarmRepository.findUnreadAlarms).toHaveBeenCalled();
        expect(commentRepository.findCommentsByPostId).toHaveBeenCalledWith(1);
        expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(alarmRepository.createAlarmSend).toHaveBeenCalledWith(expect.any(MockAlarmSend));
    });
    });
});
