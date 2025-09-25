import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
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

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 5,
    search: string = '',
  ) {
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [workspaces, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
          ...searchConditions,
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
        skip,
        take: limit,
      }),
      this.prisma.workspace.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
          ...searchConditions,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      workspaces,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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

  async getAllWorkspaceStats(userId: string) {
    const [totalWorkspaces, totalMembers, totalBoards, totalTasks] =
      await Promise.all([
        this.prisma.workspace.count({
          where: {
            members: {
              some: { userId },
            },
          },
        }),
        this.prisma.workspaceMember.count({
          where: {
            workspace: {
              members: {
                some: { userId },
              },
            },
          },
        }),
        this.prisma.board.count({
          where: {
            workspace: {
              members: {
                some: { userId },
              },
            },
          },
        }),
        this.prisma.task.count({
          where: {
            board: {
              workspace: {
                members: {
                  some: { userId },
                },
              },
            },
          },
        }),
      ]);

    return {
      totalWorkspaces,
      totalMembers,
      totalBoards,
      totalTasks,
    };
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
