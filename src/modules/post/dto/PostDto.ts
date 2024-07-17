import {IsString, IsInt, IsOptional, IsArray, ArrayNotEmpty} from "class-validator";
import {Transform, Type} from "class-transformer";
import { AuthorUserDto } from '../../user/dto/UserDto';
import { Field } from "../../../utils/mapper/FieldNameExtractor";
import {ResponseInterestDto} from "../../interest/dto/InterestDto";

export class PostPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  thumbnailURL: string;

  @IsString()
  backGroundImgURL: string;

  @IsString()
  youtubeURL: string;

  @IsString()
  @Transform(({ value }) => parseInt(value))
  categoryId: number;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map((id: string) => parseInt(id)))
  interestIds: number[];
}
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  youtubeURL?: string;

}


export class ResponsePostDto {
  @Field
  id: number;

  @Field
  title: string;

  @Field
  content: string;

  @Field
  user: AuthorUserDto;

  @Field
  createdAt: Date;

  @Field
  updatedAt: Date;

  @Field
  score: number;

  @Field
  thumbnailURL: string;

  @Field
  backGroundImgURL: string;

  @Field
  youtubeURL: string;

  @Field
  views: number;

  @Field
  interests: ResponseInterestDto[];

}

export class ShortPostDto {
  @Field
  id: number;

  @Field
  title: string;

  @Field
  thumbnailURL: string;

  @Field
  views: number;

  @Field
  score: number;
}
