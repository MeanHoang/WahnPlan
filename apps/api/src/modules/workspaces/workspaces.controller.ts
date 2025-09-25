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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: any) {
    return this.workspacesService.create(createWorkspaceDto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
    @Query('search') search: string = '',
  ) {
    console.log(
      'Workspace findAll request - User ID:',
      req.user?.id,
      'Page:',
      page,
      'Limit:',
      limit,
      'Search:',
      search,
    );
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 5;
    return this.workspacesService.findAll(
      req.user.id,
      pageNum,
      limitNum,
      search,
    );
  }

  @Get('stats')
  getAllStats(@Req() req: any) {
    console.log('Workspace stats request - User ID:', req.user?.id);
    return this.workspacesService.getAllWorkspaceStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.findOne(id, req.user.id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.getWorkspaceStats(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Req() req: any,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.remove(id, req.user.id);
  }
}
