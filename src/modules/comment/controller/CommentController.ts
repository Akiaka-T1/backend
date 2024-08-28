import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  UsePipes,
  ValidationPipe, UseGuards, Request, Req, Query
} from "@nestjs/common";
import { CommentService } from '../service/CommentService';
import { PostCommentDto } from '../dto/CommentDto';
import { UpdateCommentDto } from '../dto/CommentDto';
import { ResponseCommentDto } from '../dto/CommentDto';
import { AuthGuard } from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import { RolesGuard } from "../../../auth/authorization/RolesGuard";
import { Roles } from "../../../auth/authorization/decorator";
import { Role } from "../../../auth/authorization/Role";
import { PaginationDto } from "../../../utils/pagination/paginationDto";
import { PaginationResult } from "../../../utils/pagination/pagination";
import { AlarmService } from '../../alarm/service/AlarmService'; 

@Controller('api/comments')
@UsePipes(new ValidationPipe())
export class CommentController {
  constructor(
      private readonly commentService: CommentService,
      private readonly alarmService: AlarmService 
      ) {}

  @Post()
  @UseGuards(AuthGuard,RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(Role.User,Role.Admin)
  async create(@Body() postCommentDto: PostCommentDto, @Request() request:any): Promise<ResponseCommentDto> {
    return this.commentService.create(postCommentDto,request.user);
  }

  async createWithAlarm(@Body() postCommentDto: PostCommentDto, @Request() request: any): Promise<ResponseCommentDto> {
    const newComment = await this.commentService.create(postCommentDto, request.user);
    
    // postId를 기준으로 모든 댓글을 가져오기
    const comments = await this.commentService.findByPostId(postCommentDto.postId);

    // 각 댓글 작성자의 nickname을 가져오기
    const nicknames = comments.map(comment => comment.user.nickname);

    // 알림 생성 및 전송 (닉네임 기반으로 변경)
    await this.alarmService.createAndSendAlarms(postCommentDto.postId, nicknames);

    return newComment;
}

  @Get('user')
  async findByUser(@Query() paginationDto: PaginationDto, @Request() request: any): Promise<PaginationResult<ResponseCommentDto>> {
    return this.commentService.findByUserId(request.user.id, paginationDto);
  }

  @Get('my')
  @UseGuards(AuthGuard,RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(Role.User,Role.Admin)
  async findMyComment(@Query() paginationDto: PaginationDto, @Request() request: any): Promise<PaginationResult<ResponseCommentDto>> {
    return this.commentService.findByUserId(request.user.sub, paginationDto);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ResponseCommentDto> {
    return this.commentService.findById(id);
  }

  @Get('post/:postId')
  async findByPostId(@Param('postId', ParseIntPipe) postId: number): Promise<ResponseCommentDto[]> {
    return this.commentService.findByPostId(postId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard,RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(Role.User,Role.Admin)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto): Promise<ResponseCommentDto> {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.User,Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commentService.remove(id);
  }
}