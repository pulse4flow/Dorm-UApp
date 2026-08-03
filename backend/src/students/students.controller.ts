import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
