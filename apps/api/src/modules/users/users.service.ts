import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        language: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        language: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }
}
