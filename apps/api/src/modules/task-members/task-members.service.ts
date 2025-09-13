import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskMemberDto } from './dto/create-task-member.dto';
import { UpdateTaskMemberDto } from './dto/update-task-member.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TaskMembersService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskMemberDto: CreateTaskMemberDto, userId: string) {
    // Check if user has permission to add members to task
    const task = await this.prisma.task.findFirst({
      where: {
        id: createTaskMemberDto.taskId,
        board: {
          workspace: {
            members: {
              some: {
                userId,
                role: {
                  in: [
                    WorkspaceMemberRole.owner,
                    WorkspaceMemberRole.manager,
                    WorkspaceMemberRole.member,
                  ],
                },
              },
            },
          },
        },
      },
      include: {
        board: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!task) {
      throw new ForbiddenException(
        'Insufficient permissions to add task member',
      );
    }

    // Check if the user to be added is a member of the workspace
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: task.board.workspaceId,
        userId: createTaskMemberDto.userId,
      },
    });

    if (!workspaceMember) {
      throw new BadRequestException('User is not a member of the workspace');
    }

    // Check if user is already a member of the task
    const existingMember = await this.prisma.taskMember.findFirst({
      where: {
        taskId: createTaskMemberDto.taskId,
        userId: createTaskMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this task');
    }

    return this.prisma.taskMember.create({
      data: {
        taskId: createTaskMemberDto.taskId,
        userId: createTaskMemberDto.userId,
        position: createTaskMemberDto.position,
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
        task: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                workspace: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    taskId: string | undefined,
    userId: string,
    filterUserId?: string,
  ) {
    // If filtering by userId, get all tasks where user is a member
    if (filterUserId && !taskId) {
      return this.prisma.taskMember.findMany({
        where: {
          userId: filterUserId,
          task: {
            board: {
              workspace: {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
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
          task: {
            select: {
              id: true,
              title: true,
              board: {
                select: {
                  id: true,
                  title: true,
                  workspace: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      });
    }

    // Original logic for getting members of a specific task
    if (!taskId) {
      throw new BadRequestException(
        'taskId is required when not filtering by userId',
      );
    }

    // Check if user has access to the task
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        board: {
          workspace: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new ForbiddenException('Access denied to task');
    }

    return this.prisma.taskMember.findMany({
      where: {
        taskId,
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
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const taskMember = await this.prisma.taskMember.findFirst({
      where: {
        id,
        task: {
          board: {
            workspace: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        },
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
        task: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                workspace: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!taskMember) {
      throw new NotFoundException('Task member not found');
    }

    return taskMember;
  }

  async update(
    id: string,
    updateTaskMemberDto: UpdateTaskMemberDto,
    userId: string,
  ) {
    // First get the task member to check task access
    const taskMember = await this.prisma.taskMember.findFirst({
      where: {
        id,
        task: {
          board: {
            workspace: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      },
      include: {
        task: {
          include: {
            board: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });

    if (!taskMember) {
      throw new NotFoundException('Task member not found');
    }

    // Check if user has permission to update task member
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskMember.task.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to update task member',
      );
    }

    return this.prisma.taskMember.update({
      where: { id },
      data: updateTaskMemberDto,
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
        task: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                workspace: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // First get the task member to check task access
    const taskMember = await this.prisma.taskMember.findFirst({
      where: {
        id,
        task: {
          board: {
            workspace: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      },
      include: {
        task: {
          include: {
            board: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });

    if (!taskMember) {
      throw new NotFoundException('Task member not found');
    }

    // Check if user has permission to remove task member
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskMember.task.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to remove task member',
      );
    }

    await this.prisma.taskMember.delete({
      where: { id },
    });

    return { message: 'Task member removed successfully' };
  }

  async reorder(taskId: string, memberIds: string[], userId: string) {
    // Check if user has access to the task
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        board: {
          workspace: {
            members: {
              some: {
                userId,
                role: {
                  in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new ForbiddenException('Access denied to task');
    }

    // Update positions
    const updatePromises = memberIds.map((memberId, index) =>
      this.prisma.taskMember.update({
        where: { id: memberId },
        data: { position: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Task members reordered successfully' };
  }
}
