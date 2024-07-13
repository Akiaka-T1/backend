import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { UserService } from "../service/UserService";
import { PostUserDto, ResponseUserDto, UpdateUserDto } from "../dto/UserDto";
import { AuthGuard } from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import { Role } from "../../../auth/authorization/Role";
import { Roles } from "../../../auth/authorization/decorator";
import { RolesGuard } from "../../../auth/authorization/RolesGuard";

@Controller('api/users')
@UsePipes(new ValidationPipe())
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('all')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    async findAll(): Promise<ResponseUserDto[]> {
        return this.userService.findAll();
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

    @Get(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseUserDto> {
        return this.userService.findById(id);
    }

    @Patch()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.User)
    async updateMe(@Request() request:any, @Body() updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
        return this.userService.update(request.user.id, updateUserDto);
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
