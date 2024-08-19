import {IsString, IsInt, IsOptional, IsArray, ArrayNotEmpty} from "class-validator";
import {Transform, Type} from "class-transformer";
import { AuthorUserDto } from '../../user/dto/UserDto';
import { Field } from "../../../utils/mapper/FieldNameExtractor";
import {ResponseInterestDto} from "../../interest/dto/InterestDto";
import {Category} from "../../category/entity/Category";
import {ResponseCategoryDto} from "../../category/dto/CategoryDto";
import {ResponseCommentDto} from "../../comment/dto/CommentDto";

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
  createdAt: string;

  @Field
  updatedAt: string;

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
  averageRating: number;

  @Field
  comments: ResponseCommentDto[];

  @Field
  category: ResponseCategoryDto;

  @Field
  interests: ResponseInterestDto[];

  @Field
  joyScore: number;

  @Field
  angerScore: number;

  @Field
  irritationScore: number;

  @Field
  fearScore: number;

  @Field
  sadnessScore: number;

}

export class ThumbnailPostDto {
  @Field
  id: number;

  @Field
  title: string;

  @Field
  thumbnail_URL: string;

  @Field
  views: number;

  @Field
  score: number;
}

export class ShortContentPostDto {
  @Field
  id: number;

  @Field
  title: string;

  @Field
  preview: string;

  @Field
  user: AuthorUserDto;

  @Field
  thumbnailURL: string;

  @Field
  views: number;

  @Field
  averageRating: number;

  @Field
  comments: ResponseCommentDto[];

  @Field
  category: ResponseCategoryDto;

  @Field
  joyScore: number;

  @Field
  angerScore: number;

  @Field
  irritationScore: number;

  @Field
  fearScore: number;

  @Field
  sadnessScore: number;

  @Field
  updatedAt: string;

  @Field
  createdAt: string;

}