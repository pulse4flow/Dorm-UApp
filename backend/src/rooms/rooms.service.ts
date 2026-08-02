import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cacheService } from '../common/cache.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { building?: string; floor?: number; status?: string }) {
    const where: any = {};
    if (query?.building) where.building = query.building;
    if (query?.floor) where.floor = query.floor;
    if (query?.status) where.status = query.status;

    return this.prisma.room.findMany({
      where,
      include: { students: true },
      orderBy: [{ building: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async findAvailable() {
    return this.prisma.room.findMany({
      where: { status: 'available' },
      orderBy: [{ building: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async getStats() {
    const cached = cacheService.get<{ total: number; available: number; occupied: number; maintenance: number }>('rooms:stats');
    if (cached) return cached;

    const [total, available, occupied, maintenance] = await Promise.all([
      this.prisma.room.count(),
      this.prisma.room.count({ where: { status: 'available' } }),
      this.prisma.room.count({ where: { status: 'occupied' } }),
      this.prisma.room.count({ where: { status: 'maintenance' } }),
    ]);

    const stats = { total, available, occupied, maintenance };
    cacheService.set('rooms:stats', stats, 30000); // Cache for 30 seconds
    return stats;
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async findByNumber(roomNumber: string) {
    const room = await this.prisma.room.findUnique({
      where: { roomNumber },
      include: { students: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async create(data: { roomNumber: string; building: string; floor: number; capacity?: number }) {
    return this.prisma.room.create({
      data: {
        ...data,
        capacity: data.capacity || 2,
      },
    });
  }

  async update(id: string, data: { roomNumber?: string; building?: string; floor?: number; capacity?: number }) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.room.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.room.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async delete(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await this.prisma.room.delete({ where: { id } });
    return { message: 'Room deleted successfully' };
  }
}
