import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from "@nestjs/common";
import {CategoryService} from "../service/CategoryService";
import {PostCategoryDto, ResponseCategoryDto, UpdateCategoryDto} from "../dto/CategoryDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {AuthGuard} from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import {RolesGuard} from "../../../auth/authorization/RolesGuard";
import {Roles} from "../../../auth/authorization/decorator";
import {Role} from "../../../auth/authorization/Role";

@Controller('api/categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    post(@Body() postCategoryDto: PostCategoryDto): Promise<ResponseCategoryDto> {
        return this.categoryService.post(postCategoryDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResult<ResponseCategoryDto>> {
        return this.categoryService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseCategoryDto> {
        return this.categoryService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<ResponseCategoryDto> {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.categoryService.remove(id);
    }
}