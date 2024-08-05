import {Repository, FindManyOptions, FindOptionsOrder, SelectQueryBuilder} from 'typeorm';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
export interface PaginationOptions {
  page: number;
  limit: number;
  field?: string;
  order?: 'ASC' | 'DESC';
}

export async function paginate<T>(
  repository: Repository<T>,
  { page = 1, limit = 10, field, order }: PaginationOptions,
  options?: FindManyOptions<T>
): Promise<PaginationResult<T>> {
  const findOptions: FindManyOptions<T> = {
    skip: (page - 1) * limit,
    take: limit,
    order: field ? {[field]: order} as FindOptionsOrder<T> : undefined,
    ...options,
  };

  const [data, total] = await repository.findAndCount(findOptions);

  return {
    data,
    total,
    page,
    limit,
  };
}

  export async function paginateWithQueryBuilder<T>(
      queryBuilder: SelectQueryBuilder<T>,
      { page = 1, limit = 5, field, order }: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const offset = (page - 1) * limit;

    if (field) {
      queryBuilder.orderBy(`${queryBuilder.alias}.${field}`, order);
    }

    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }