import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.studentsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: string) {
    return this.studentsService.findByRoom(roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('student-id/:studentId')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.studentsService.findByStudentId(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post()
  create(@Body() data: { studentId: string; name: string; roomId: string; userId: number }) {
    return this.studentsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { studentId?: string; name?: string; roomId?: string }) {
    return this.studentsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
