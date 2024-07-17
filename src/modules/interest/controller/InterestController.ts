import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from "@nestjs/common";
import {InterestService} from "../service/InterestService";
import {PostInterestDto, ResponseInterestDto, UpdateInterestDto} from "../dto/InterestDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {AuthGuard} from "../../../auth/JwtAuthGuard/JwtAuthGuard";
import {RolesGuard} from "../../../auth/authorization/RolesGuard";
import {Roles} from "../../../auth/authorization/decorator";
import {Role} from "../../../auth/authorization/Role";

@Controller('api/interests')
export class InterestController {
    constructor(private readonly interestService: InterestService) {}

    @Get()
    findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResult<ResponseInterestDto>> {
        return this.interestService.findAllAndPaginate(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseInterestDto> {
        return this.interestService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.Admin)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateInterestDto: UpdateInterestDto): Promise<ResponseInterestDto> {
        return this.interestService.update(id, updateInterestDto);
    }

}