import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('score')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-score')
  getMyScore(@CurrentUser() user: any) {
    return this.scoresService.getMyScore(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-history')
  getMyHistory(@CurrentUser() user: any) {
    return this.scoresService.getMyHistory(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('student/:studentId')
  getStudentScore(@Param('studentId') studentId: string) {
    return this.scoresService.getStudentScore(studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Get('history')
  getHistory(@Query() query: { studentId?: string; page?: number; limit?: number }) {
    return this.scoresService.getHistory(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Get('history/:studentId')
  getHistoryByStudent(@Param('studentId') studentId: string) {
    return this.scoresService.getHistoryByStudent(studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Get('all')
  getAll(@Query() query: { page?: number; limit?: number; sortBy?: string }) {
    return this.scoresService.getAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.scoresService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post('adjust')
  adjustScore(@Body() data: { studentId: string; score: number; reason: string }) {
    return this.scoresService.adjustScore({
      ...data,
      changedBy: 'manager',
    });
  }
}
