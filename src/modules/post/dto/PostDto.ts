import {IsString, IsInt, IsOptional, IsArray} from "class-validator";
import { Type } from "class-transformer";
import { AuthorUserDto } from '../../user/dto/UserDto';
import { Field } from "../../../utils/mapper/FieldNameExtractor";

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
