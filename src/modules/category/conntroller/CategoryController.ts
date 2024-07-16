import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query} from "@nestjs/common";
import {CategoryService} from "../service/CategoryService";
import {PostCategoryDto, ResponseCategoryDto, UpdateCategoryDto} from "../dto/CategoryDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";

@Controller('api/categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<ResponseCategoryDto> {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.categoryService.remove(id);
    }
}