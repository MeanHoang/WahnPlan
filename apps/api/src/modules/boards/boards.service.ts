import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    // Check if user has permission to create board in workspace
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: createBoardDto.workspaceId,
        userId,
        role: {
          in: [
            WorkspaceMemberRole.owner,
            WorkspaceMemberRole.manager,
            WorkspaceMemberRole.member,
          ],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to create board');
    }

    return this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        subtitle: createBoardDto.subtitle,
        workspaceId: createBoardDto.workspaceId,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            taskStatuses: true,
            taskPriorities: true,
            taskInitiatives: true,
          },
        },
      },
    });
  }

  async findAll(workspaceId: string, userId: string) {
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

    return this.prisma.board.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            taskStatuses: true,
            taskPriorities: true,
            taskInitiatives: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        taskStatuses: {
          orderBy: {
            position: 'asc',
          },
        },
        taskPriorities: {
          orderBy: {
            position: 'asc',
          },
        },
        taskInitiatives: {
          orderBy: {
            position: 'asc',
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            tester: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            baUser: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            taskMembers: {
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
            taskStatus: true,
            taskPriority: true,
            taskInitiative: true,
            _count: {
              select: {
                taskMembers: true,
                taskComments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            tasks: true,
            taskStatuses: true,
            taskPriorities: true,
            taskInitiatives: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    // First get the board to check workspace access
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user has permission to update board
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to update board');
    }

    // If workspaceId is being updated, check access to new workspace
    if (
      updateBoardDto.workspaceId &&
      updateBoardDto.workspaceId !== board.workspaceId
    ) {
      const newWorkspaceMember = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: updateBoardDto.workspaceId,
          userId,
          role: {
            in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
          },
        },
      });

      if (!newWorkspaceMember) {
        throw new ForbiddenException(
          'Insufficient permissions in target workspace',
        );
      }
    }

    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            taskStatuses: true,
            taskPriorities: true,
            taskInitiatives: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // First get the board to check workspace access
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user has permission to delete board
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to delete board');
    }

    await this.prisma.board.delete({
      where: { id },
    });

    return { message: 'Board deleted successfully' };
  }

  async getBoardStats(boardId: string, userId: string) {
    // Check if user has access to the board
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!board) {
      throw new ForbiddenException('Access denied to board');
    }

    const [
      taskCount,
      completedTaskCount,
      overdueTaskCount,
      statusCount,
      priorityCount,
      initiativeCount,
    ] = await Promise.all([
      this.prisma.task.count({
        where: { boardId },
      }),
      this.prisma.task.count({
        where: {
          boardId,
          taskStatus: {
            title: {
              contains: 'Done',
            },
          },
        },
      }),
      this.prisma.task.count({
        where: {
          boardId,
          dueDate: {
            lt: new Date(),
          },
          taskStatus: {
            title: {
              not: {
                contains: 'Done',
              },
            },
          },
        },
      }),
      this.prisma.taskStatus.count({
        where: { boardId },
      }),
      this.prisma.taskPriority.count({
        where: { boardId },
      }),
      this.prisma.taskInitiative.count({
        where: { boardId },
      }),
    ]);

    return {
      taskCount,
      completedTaskCount,
      overdueTaskCount,
      statusCount,
      priorityCount,
      initiativeCount,
    };
  }

  async exportTasks(
    boardId: string,
    userId: string,
    filters: {
      createdAtFrom?: string;
      createdAtTo?: string;
      statusIds: string[];
      isDone: boolean | null;
    },
  ) {
    // Check if user has access to the board
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user is a member of the workspace
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: board.workspaceId,
        userId,
        role: {
          in: [
            WorkspaceMemberRole.owner,
            WorkspaceMemberRole.manager,
            WorkspaceMemberRole.member,
          ],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied to this board');
    }

    // Build where clause for filtering
    const whereClause: any = {
      boardId,
    };

    // Date range filter
    if (filters.createdAtFrom || filters.createdAtTo) {
      whereClause.createdAt = {};
      if (filters.createdAtFrom) {
        whereClause.createdAt.gte = new Date(filters.createdAtFrom);
      }
      if (filters.createdAtTo) {
        whereClause.createdAt.lte = new Date(filters.createdAtTo);
      }
    }

    // Status filter
    if (filters.statusIds.length > 0) {
      whereClause.taskStatusId = {
        in: filters.statusIds,
      };
    }

    // Is Done filter
    if (filters.isDone !== null) {
      whereClause.isDone = filters.isDone;
    }

    // Fetch tasks with all related data
    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: {
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        tester: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      tasks,
      filters,
      generatedAt: new Date(),
      totalTasks: tasks.length,
    };
  }

  async findRecentBoards(userId: string) {
    // Get all boards from workspaces where user is a member
    // Sort by most recent activity (based on updatedAt and task activity)
    return this.prisma.board.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            taskStatuses: true,
            taskPriorities: true,
            taskInitiatives: true,
          },
        },
        tasks: {
          select: {
            id: true,
            updatedAt: true,
            createdAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20, // Limit to 20 most recent boards
    });
  }
}
