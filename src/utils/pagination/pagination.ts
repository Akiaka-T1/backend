import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
interface PaginationOptions {
  page: number;
  limit: number;
  field?: string;
  order?: 'ASC' | 'DESC';
}

export async function paginate<T>(
  repository: Repository<T>,
  { page, limit, field, order }: PaginationOptions,
  options?: FindManyOptions<T>
): Promise<PaginationResult<T>> {
  const findOptions: FindManyOptions<T> = {
    skip: (page - 1) * limit,
    take: limit,
    order: field ? { [field]: order } as FindOptionsOrder<T> : undefined,
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