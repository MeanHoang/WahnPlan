import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TaskCommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateTaskCommentDto, userId: string) {
    // Check if user has permission to comment on task
    const task = await this.prisma.task.findFirst({
      where: {
        id: createCommentDto.taskId,
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
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!task) {
      throw new ForbiddenException(
        'Insufficient permissions to comment on this task',
      );
    }

    // Validate mentioned users exist and have access to the workspace
    if (createCommentDto.mentions && createCommentDto.mentions.length > 0) {
      const mentionedUserIds = createCommentDto.mentions.map(
        (m) => m.mentionedUserId,
      );
      const validMentionedUsers = await this.prisma.user.findMany({
        where: {
          id: { in: mentionedUserIds },
          workspaceMembers: {
            some: {
              workspaceId: task.board.workspaceId,
            },
          },
        },
      });

      if (validMentionedUsers.length !== mentionedUserIds.length) {
        throw new BadRequestException(
          'Some mentioned users do not have access to this workspace',
        );
      }
    }

    // Create comment with attachments and mentions
    const comment = await this.prisma.taskComment.create({
      data: {
        taskId: createCommentDto.taskId,
        authorId: userId,
        contentJson: createCommentDto.contentJson,
        contentPlain: createCommentDto.contentPlain,
        commentAttachments: createCommentDto.attachments
          ? {
              create: createCommentDto.attachments.map((attachment) => ({
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
                fileSize: attachment.fileSize || 0,
                fileType: attachment.fileType,
                mimeType: attachment.mimeType,
              })),
            }
          : undefined,
        commentMentions: createCommentDto.mentions
          ? {
              create: createCommentDto.mentions.map((mention) => ({
                mentionedUserId: mention.mentionedUserId,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        commentAttachments: true,
        commentMentions: {
          include: {
            mentionedUser: {
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
        commentReactions: {
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
    });

    return comment;
  }

  async findAll(taskId: string, userId: string, query: CommentQueryDto) {
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
    });

    if (!task) {
      throw new ForbiddenException(
        'Insufficient permissions to view comments for this task',
      );
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.taskComment.findMany({
        where: { taskId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              fullname: true,
              publicName: true,
              avatarUrl: true,
            },
          },
          commentAttachments: true,
          commentMentions: {
            include: {
              mentionedUser: {
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
          commentReactions: {
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.taskComment.count({
        where: { taskId },
      }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id,
        task: {
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
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        commentAttachments: true,
        commentMentions: {
          include: {
            mentionedUser: {
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
        commentReactions: {
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
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or insufficient permissions',
      );
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateTaskCommentDto,
    userId: string,
  ) {
    // Check if comment exists and user is the author
    const existingComment = await this.prisma.taskComment.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });

    if (!existingComment) {
      throw new NotFoundException(
        'Comment not found or insufficient permissions to edit',
      );
    }

    // Update comment
    const comment = await this.prisma.taskComment.update({
      where: { id },
      data: {
        contentJson: updateCommentDto.contentJson,
        contentPlain: updateCommentDto.contentPlain,
        isEdited: true,
        // Handle attachments update if provided
        ...(updateCommentDto.attachments && {
          commentAttachments: {
            deleteMany: {},
            create: updateCommentDto.attachments.map((attachment) => ({
              fileName: attachment.fileName!,
              fileUrl: attachment.fileUrl!,
              fileSize: attachment.fileSize || 0,
              fileType: attachment.fileType!,
              mimeType: attachment.mimeType!,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        commentAttachments: true,
        commentMentions: {
          include: {
            mentionedUser: {
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
        commentReactions: {
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
    });

    return comment;
  }

  async remove(id: string, userId: string) {
    // Check if comment exists and user is the author or has admin permissions
    const existingComment = await this.prisma.taskComment.findFirst({
      where: {
        id,
        OR: [
          { authorId: userId },
          {
            task: {
              board: {
                workspace: {
                  members: {
                    some: {
                      userId,
                      role: {
                        in: [
                          WorkspaceMemberRole.owner,
                          WorkspaceMemberRole.manager,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!existingComment) {
      throw new NotFoundException(
        'Comment not found or insufficient permissions to delete',
      );
    }

    await this.prisma.taskComment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }

  // Comment Reactions
  async addReaction(commentId: string, emoji: string, userId: string) {
    // Check if user has access to the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
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
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to react to this comment',
      );
    }

    // Upsert reaction (remove if exists, add if not)
    const existingReaction = await this.prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await this.prisma.commentReaction.delete({
        where: {
          commentId_userId_emoji: {
            commentId,
            userId,
            emoji,
          },
        },
      });
      return { message: 'Reaction removed' };
    } else {
      await this.prisma.commentReaction.create({
        data: {
          commentId,
          userId,
          emoji,
        },
      });
      return { message: 'Reaction added' };
    }
  }

  // Comment Attachments
  async addAttachment(commentId: string, attachmentData: any, userId: string) {
    // Check if user is the author of the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        authorId: userId,
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to add attachment to this comment',
      );
    }

    const attachment = await this.prisma.commentAttachment.create({
      data: {
        commentId,
        fileName: attachmentData.fileName,
        fileUrl: attachmentData.fileUrl,
        fileSize: attachmentData.fileSize || 0,
        fileType: attachmentData.fileType,
        mimeType: attachmentData.mimeType,
      },
    });

    return attachment;
  }

  async removeAttachment(attachmentId: string, userId: string) {
    // Check if user is the author of the comment
    const attachment = await this.prisma.commentAttachment.findFirst({
      where: {
        id: attachmentId,
        comment: {
          authorId: userId,
        },
      },
    });

    if (!attachment) {
      throw new ForbiddenException(
        'Insufficient permissions to remove this attachment',
      );
    }

    await this.prisma.commentAttachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment removed successfully' };
  }
}
