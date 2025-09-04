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
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
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
  findAll(@Req() req: any) {
    return this.workspacesService.findAll(req.user.id);
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

  @Get(':id/members')
  getMembers(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.getMembers(id, req.user.id);
  }

  @Post(':id/members/invite')
  inviteMember(
    @Param('id') id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Req() req: any,
  ) {
    return this.workspacesService.inviteMember(
      id,
      inviteMemberDto,
      req.user.id,
    );
  }

  @Patch(':id/members/:memberId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    return this.workspacesService.updateMemberRole(
      id,
      memberId,
      updateMemberRoleDto,
      req.user.id,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    return this.workspacesService.removeMember(id, memberId, req.user.id);
  }

  @Post(':id/leave')
  leaveWorkspace(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.leaveWorkspace(id, req.user.id);
  }
}
