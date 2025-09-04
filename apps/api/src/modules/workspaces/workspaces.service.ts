import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    return this.prisma.workspace.create({
      data: {
        ...createWorkspaceDto,
        members: {
          create: {
            userId,
            role: WorkspaceMemberRole.owner,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
        },
        boards: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: string,
  ) {
    // Check if user has permission to update workspace
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to update workspace',
      );
    }

    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    return workspace;
  }

  async remove(id: string, userId: string) {
    // Check if user is the owner
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: WorkspaceMemberRole.owner,
      },
    });

    if (!member) {
      throw new ForbiddenException('Only workspace owner can delete workspace');
    }

    await this.prisma.workspace.delete({
      where: { id },
    });

    return { message: 'Workspace deleted successfully' };
  }

  async getMembers(workspaceId: string, userId: string) {
    // Check if user is a member of the workspace
    const userMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!userMember) {
      throw new ForbiddenException('Access denied to workspace');
    }

    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
            jobTitle: true,
            organization: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async inviteMember(
    workspaceId: string,
    inviteMemberDto: InviteMemberDto,
    inviterId: string,
  ) {
    // Check if inviter has permission to invite members
    const inviterMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: inviterId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!inviterMember) {
      throw new ForbiddenException(
        'Insufficient permissions to invite members',
      );
    }

    // Find the user to invite
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: inviteMemberDto.email },
    });

    if (!userToInvite) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: userToInvite.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this workspace',
      );
    }

    // Create workspace member
    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToInvite.id,
        role: inviteMemberDto.role || WorkspaceMemberRole.member,
        invitedBy: inviterId,
        action: inviteMemberDto.message,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
          },
        },
      },
    });

    return member;
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
    userId: string,
  ) {
    // Check if user has permission to update member roles
    const userMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!userMember) {
      throw new ForbiddenException(
        'Insufficient permissions to update member roles',
      );
    }

    // Check if target member exists
    const targetMember = await this.prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    // Prevent non-owners from changing owner role
    if (
      targetMember.role === WorkspaceMemberRole.owner &&
      userMember.role !== WorkspaceMemberRole.owner
    ) {
      throw new ForbiddenException(
        'Only workspace owner can change owner role',
      );
    }

    // Prevent changing the last owner
    if (
      targetMember.role === WorkspaceMemberRole.owner &&
      updateMemberRoleDto.role !== WorkspaceMemberRole.owner
    ) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceMemberRole.owner,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last owner from workspace',
        );
      }
    }

    const updatedMember = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: updateMemberRoleDto.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
          },
        },
      },
    });

    return updatedMember;
  }

  async removeMember(workspaceId: string, memberId: string, userId: string) {
    // Check if user has permission to remove members
    const userMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!userMember) {
      throw new ForbiddenException(
        'Insufficient permissions to remove members',
      );
    }

    // Check if target member exists
    const targetMember = await this.prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    // Prevent removing the last owner
    if (targetMember.role === WorkspaceMemberRole.owner) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceMemberRole.owner,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last owner from workspace',
        );
      }
    }

    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed successfully' };
  }

  async leaveWorkspace(workspaceId: string, userId: string) {
    // Check if user is a member
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this workspace');
    }

    // Prevent the last owner from leaving
    if (member.role === WorkspaceMemberRole.owner) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceMemberRole.owner,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot leave workspace as the last owner. Transfer ownership or delete workspace instead.',
        );
      }
    }

    await this.prisma.workspaceMember.delete({
      where: { id: member.id },
    });

    return { message: 'Left workspace successfully' };
  }

  async getWorkspaceStats(workspaceId: string, userId: string) {
    // Check if user is a member of the workspace
    const userMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!userMember) {
      throw new ForbiddenException('Access denied to workspace');
    }

    const [memberCount, boardCount, taskCount] = await Promise.all([
      this.prisma.workspaceMember.count({
        where: { workspaceId },
      }),
      this.prisma.board.count({
        where: { workspaceId },
      }),
      this.prisma.task.count({
        where: {
          board: {
            workspaceId,
          },
        },
      }),
    ]);

    return {
      memberCount,
      boardCount,
      taskCount,
    };
  }
}
