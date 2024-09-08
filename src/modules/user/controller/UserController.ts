import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post, Query,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { UserService } from "../service/UserService";
import {
    CharacterUserDto,
    PostUserDto,
    ResponseUserDto,
    ResponseUserWithInterestsAndCategoriesDto,
    UpdateUserDto
} from "../dto/UserDto";
import { AuthGuard } from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import { Role } from "../../../auth/authorization/Role";
import { Roles } from "../../../auth/authorization/decorator";
import { RolesGuard } from "../../../auth/authorization/RolesGuard";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";

@Controller('api/users')
@UsePipes(new ValidationPipe())
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('all')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResult<ResponseUserDto>> {
        return this.userService.findAll(paginationDto);
    }

    @Post()
    async create(@Body() postUserDto: PostUserDto): Promise<ResponseUserDto> {
        return this.userService.create(postUserDto);
    }

    @Get()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin,Role.User)
    async findMe(@Request() request:any): Promise<ResponseUserDto> {
        return this.userService.findMe(request.user.email);
    }

    @Get('character')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin,Role.User)
    async findMyProfile(@Request() request:any): Promise<CharacterUserDto> {
        return this.userService.findMyCharacter(request.user.email);
    }

    @Get('stats')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin,Role.User)
    async findStats(@Request() request:any): Promise<ResponseUserWithInterestsAndCategoriesDto> {
        return this.userService.findStats(request.user.email);
    }

    @Get(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseUserDto> {
        return this.userService.findById(id);
    }

    @Patch('me')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.User,Role.Admin)
    async updateMe(@Request() request:any, @Body() updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
        return this.userService.update(request.user.sub, updateUserDto);
    }

    @Patch(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.userService.remove(id);
    }
}
