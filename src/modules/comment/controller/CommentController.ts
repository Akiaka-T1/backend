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
  ValidationPipe, UseGuards, Request, Req
} from "@nestjs/common";
import { CommentService } from '../service/CommentService';
import { PostCommentDto } from '../dto/CommentDto';
import { UpdateCommentDto } from '../dto/CommentDto';
import { ResponseCommentDto } from '../dto/CommentDto';
import { AuthGuard } from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import { RolesGuard } from "../../../auth/authorization/RolesGuard";
import { Roles } from "../../../auth/authorization/decorator";
import { Role } from "../../../auth/authorization/Role";
import {User} from "../../user/entity/User";
import {AuthService} from "../../../auth/service/AuthService";

@Controller('api/comments')
@UsePipes(new ValidationPipe())
export class CommentController {
  constructor(
      private readonly commentService: CommentService,
      private readonly authService: AuthService,
      ) {}

  @Post()
  @UseGuards(AuthGuard,RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(Role.User,Role.Admin)
  async create(@Body() postCommentDto: PostCommentDto, @Req() req: Request): Promise<ResponseCommentDto> {
    const token = this.authService.getTokenFromRequest(req);
    const user = await this.authService.validateUserByToken(token);
    return this.commentService.create(postCommentDto,user);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ResponseCommentDto> {
    return this.commentService.findById(id);
  }

  @Get('post/:postId')
  async findByPostId(@Param('postId', ParseIntPipe) postId: number): Promise<ResponseCommentDto[]> {
    return this.commentService.findByPostId(postId);
  }

  @Get('user')
  async findByUser(@Request() request: any): Promise<ResponseCommentDto[]> {
    return this.commentService.findByUserId(request.user.id);
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