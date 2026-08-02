import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RepairsService } from './repairs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('repairs')
export class RepairsController {
  constructor(
    private readonly repairsService: RepairsService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { status?: string; category?: string; page?: number; limit?: number; search?: string }) {
    return this.repairsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.repairsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-requests')
  async findMyRequests(@CurrentUser() user: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return [];
    }

    return this.repairsService.findByStudent(student.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.repairsService.findByStudent(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: string) {
    return this.repairsService.findByRoom(roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repairsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() data: { roomNumber: string; category: string; priority?: string; description: string; imageUrl?: string }) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    const room = await this.prisma.room.findUnique({
      where: { roomNumber: data.roomNumber },
    });

    if (!student || !room) {
      throw new Error('Student or Room not found');
    }

    const { roomNumber, ...repairData } = data;

    return this.repairsService.create({
      ...repairData,
      studentId: student.id,
      roomId: room.id,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser() user: any) {
    const updatedBy = user?.name || user?.email || 'Manager';
    return this.repairsService.updateStatus(id, status, updatedBy);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { category?: string; priority?: string; description?: string; status?: string; imageUrl?: string }) {
    return this.repairsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repairsService.delete(id);
  }
}
