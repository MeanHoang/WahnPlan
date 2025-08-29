import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }
}
