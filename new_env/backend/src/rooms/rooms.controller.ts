import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { building?: string; floor?: number; status?: string }) {
    return this.roomsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('available')
  findAvailable() {
    return this.roomsService.findAvailable();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.roomsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('number/:roomNumber')
  findByNumber(@Param('roomNumber') roomNumber: string) {
    return this.roomsService.findByNumber(roomNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post()
  create(@Body() data: { roomNumber: string; building: string; floor: number; capacity?: number }) {
    return this.roomsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { roomNumber?: string; building?: string; floor?: number; capacity?: number }) {
    return this.roomsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.roomsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roomsService.delete(id);
  }
}
