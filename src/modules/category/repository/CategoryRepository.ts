import {Category} from "../entity/Category";
import {Injectable} from "@nestjs/common";
import {DataSource, FindManyOptions, Repository} from "typeorm";
import {PaginationResult,PaginationOptions,paginate} from "../../../utils/pagination/pagination";
import {Interest} from "../../interest/entity/Interest";

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<Category | undefined> {
        return this.findOne({ where: { id } });
    }
    async findAll(): Promise<Category[]> {
        return this.find();
    }

    async paginate(options: PaginationOptions, findOptions?: FindManyOptions<Category>): Promise<PaginationResult<Category>> {
        return paginate(this, options, findOptions);
    }
}
