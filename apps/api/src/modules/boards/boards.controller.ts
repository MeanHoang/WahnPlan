import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Req() req: any) {
    return this.boardsService.create(createBoardDto, req.user.id);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string, @Req() req: any) {
    if (!workspaceId) {
      throw new Error('workspaceId query parameter is required');
    }
    return this.boardsService.findAll(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.boardsService.findOne(id, req.user.id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Req() req: any) {
    return this.boardsService.getBoardStats(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Req() req: any,
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.boardsService.remove(id, req.user.id);
  }
}
