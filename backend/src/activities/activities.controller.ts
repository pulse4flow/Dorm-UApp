import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { status?: string; search?: string; page?: number; limit?: number }) {
    return this.activitiesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: number) {
    return this.activitiesService.findUpcoming(limit || 5);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-activities')
  async findMyActivities(@CurrentUser() user: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return [];
    }

    return this.activitiesService.findMyActivities(student.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post()
  create(@CurrentUser() user: any, @Body() data: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    maxParticipants?: number;
  }) {
    return this.activitiesService.create({ ...data, createdBy: user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
    maxParticipants?: number;
  }) {
    return this.activitiesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async join(@Param('id') id: string, @CurrentUser() user: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return this.activitiesService.join(id, student.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  async leave(@Param('id') id: string, @CurrentUser() user: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return this.activitiesService.leave(id, student.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/participants')
  getParticipants(@Param('id') id: string) {
    return this.activitiesService.getParticipants(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.activitiesService.delete(id);
  }
}
