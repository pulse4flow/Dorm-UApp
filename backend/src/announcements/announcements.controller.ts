import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { type?: string; page?: number; limit?: number }) {
    return this.announcementsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest')
  findLatest(@Query('limit') limit?: number) {
    return this.announcementsService.findLatest(limit || 5);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post()
  create(@CurrentUser() user: any, @Body() data: { title: string; message: string; type: string }) {
    return this.announcementsService.create({ ...data, createdBy: user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { title?: string; message?: string; type?: string }) {
    return this.announcementsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }
}
