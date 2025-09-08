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
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workspaces/:id/members')
@UseGuards(JwtAuthGuard)
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  getMembers(@Param('id') id: string, @Req() req: any) {
    return this.workspaceMembersService.getMembers(id, req.user.id);
  }

  @Post('invite')
  inviteMember(
    @Param('id') id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Req() req: any,
  ) {
    return this.workspaceMembersService.inviteMember(
      id,
      inviteMemberDto,
      req.user.id,
    );
  }

  @Patch(':memberId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    return this.workspaceMembersService.updateMemberRole(
      id,
      memberId,
      updateMemberRoleDto,
      req.user.id,
    );
  }

  @Delete(':memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    return this.workspaceMembersService.removeMember(id, memberId, req.user.id);
  }

  @Post('leave')
  leaveWorkspace(@Param('id') id: string, @Req() req: any) {
    return this.workspaceMembersService.leaveWorkspace(id, req.user.id);
  }
}
