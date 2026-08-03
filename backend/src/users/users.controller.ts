import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(
    @Body()
    data: {
      username: string;
      password: string;
      name: string;
      role: string;
      studentId?: string;
      roomId?: string;
      dormScore?: number;
    },
  ) {
    return this.usersService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      name?: string;
      roomId?: string;
      dormScore?: number;
      role?: string;
      studentId?: string;
      password?: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    if (data.role && currentUser && currentUser.id === id) {
      throw new ForbiddenException('You cannot change your own role.');
    }
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
