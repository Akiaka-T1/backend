import { BaseEntity } from 'typeorm';
import { MockUser } from './MockUser';

export class MockAlarm extends BaseEntity {
    id = 1;
    type = 'comment';  // 기본적으로 댓글 알림으로 설정
    postId = 1;
    sendCheck = false;  // 알림이 전송되지 않은 상태
    createdAt = new Date();
    updatedAt = new Date();
}

export class MockAlarmSend extends BaseEntity {
    id = 1;
    alarm = new MockAlarm();  // 알림과 연관
    user = new MockUser();  // 알림을 받는 사용자
    isRead = false;  // 읽지 않은 상태
    createdAt = new Date();
}
