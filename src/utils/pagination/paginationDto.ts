import { IsOptional, IsInt, Min, IsString, IsIn } from "class-validator";
import { Transform, Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => value ?? 1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => value ?? 10)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
