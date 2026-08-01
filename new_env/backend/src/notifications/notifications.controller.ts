import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query() query: { isRead?: boolean; type?: string; page?: number; limit?: number },
  ) {
    return this.notificationsService.findAll(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('counts')
  getCounts(@CurrentUser() user: any) {
    return this.notificationsService.getCounts(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteAll(@CurrentUser() user: any) {
    return this.notificationsService.deleteAll(user.id);
  }
}
