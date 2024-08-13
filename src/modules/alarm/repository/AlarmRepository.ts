import { EntityRepository, Repository } from 'typeorm';
import { Alarm } from '../entity/Alarm';

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
  // 알림과 관련된 데이터베이스 쿼리를 여기에 작성할 수 있습니다.
}
