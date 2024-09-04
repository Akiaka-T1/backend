import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Alarm } from './Alarm';
import { User } from '../../user/entity/User';
@Entity('alarm_send')
export class AlarmSend {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Alarm, (alarm) => alarm.id, { onDelete: 'CASCADE' })
    alarm: Alarm;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
