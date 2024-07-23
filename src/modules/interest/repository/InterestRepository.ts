import {Interest} from "../entity/Interest";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, In, Repository} from "typeorm";
import {PaginationResult,PaginationOptions,paginate} from "../../../utils/pagination/pagination";

@Injectable()
export class InterestRepository extends Repository<Interest> {
    constructor(private dataSource: DataSource) {
        super(Interest, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<Interest | undefined> {
        return this.findOne({ where: { id } });
    }
    async findByIdsForCreatePost(ids: number[]): Promise<Interest[]> {
        return this.findBy({ id: In(ids) });
    }
    async findAll(): Promise<Interest[]> {
        return this.find();
    }
    public async findMissingInterests(existingInterestIds: number[]): Promise<Interest[]> {
        return this.find({ where: { id: In(existingInterestIds) } });
    }

    async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Interest>): Promise<PaginationResult<Interest>> {
        return paginate(this, options, findOptions);
    }
}
