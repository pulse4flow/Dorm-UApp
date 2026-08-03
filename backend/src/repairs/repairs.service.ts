import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { cacheService } from '../common/cache.service';

@Injectable()
export class RepairsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query?: { status?: string; category?: string; page?: number; limit?: number; search?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status && query.status !== 'all') {
      if (query.status === 'completed' || query.status === 'resolved') {
        where.status = { in: ['completed', 'resolved'] };
      } else {
        where.status = query.status;
      }
    }

    if (query?.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query?.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.OR = [
        { description: { contains: searchTerm } },
        { student: { name: { contains: searchTerm } } },
        { student: { studentId: { contains: searchTerm } } },
        { room: { roomNumber: { contains: searchTerm } } },
      ];
    }

    const [repairs, total] = await Promise.all([
      this.prisma.repair.findMany({
        where,
        include: {
          student: { select: { id: true, studentId: true, name: true } },
          room: { select: { id: true, roomNumber: true, building: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.repair.count({ where }),
    ]);

    return { data: repairs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStats() {
    const cached = cacheService.get<{ total: number; pending: number; inProgress: number; completed: number; rejected: number }>('repairs:stats');
    if (cached) return cached;

    const [total, pending, inProgress, completed, rejected] = await Promise.all([
      this.prisma.repair.count(),
      this.prisma.repair.count({ where: { status: 'pending' } }),
      this.prisma.repair.count({ where: { status: 'in_progress' } }),
      this.prisma.repair.count({ where: { status: { in: ['completed', 'resolved'] } } }),
      this.prisma.repair.count({ where: { status: 'rejected' } }),
    ]);

    const stats = { total, pending, inProgress, completed, rejected };
    cacheService.set('repairs:stats', stats, 30000);
    return stats;
  }

  async findByStudent(studentId: string) {
    return this.prisma.repair.findMany({
      where: { studentId },
      include: {
        student: { select: { id: true, studentId: true, name: true } },
        room: { select: { id: true, roomNumber: true, building: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRoom(roomId: string) {
    return this.prisma.repair.findMany({
      where: { roomId },
      include: { student: { select: { id: true, studentId: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const repair = await this.prisma.repair.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, studentId: true, name: true } },
        room: { select: { id: true, roomNumber: true, building: true } },
      },
    });

    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    return repair;
  }

  async create(data: { studentId: string; roomId: string; category: string; priority?: string; description: string; imageUrl?: string }) {
    cacheService.invalidate('repairs:stats');
    return this.prisma.repair.create({
      data: {
        ...data,
        category: data.category as any,
        priority: (data.priority as any) || 'medium',
      },
    });
  }

  async updateStatus(id: string, status: string, updatedBy?: string) {
    const repair = await this.prisma.repair.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });
    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    cacheService.invalidate('repairs:stats');

    const updated = await this.prisma.repair.update({
      where: { id },
      data: {
        status: status as any,
        updatedBy: updatedBy || null,
      },
      include: {
        student: { select: { id: true, studentId: true, name: true, userId: true } },
        room: { select: { id: true, roomNumber: true, building: true } },
      },
    });

    if (updated.student?.userId) {
      const statusText = status.replace('_', ' ').toUpperCase();
      await this.notificationsService.create({
        userId: updated.student.userId,
        title: `Repair Request ${statusText}`,
        message: `Your repair request for "${updated.description}" has been updated to ${status}.`,
        type: 'repair',
        link: '/repairs',
      });
    }

    return updated;
  }

  async update(id: string, data: { category?: string; priority?: string; description?: string; status?: string; imageUrl?: string }) {
    const repair = await this.prisma.repair.findUnique({ where: { id } });
    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    return this.prisma.repair.update({
      where: { id },
      data: {
        ...data,
        category: data.category as any,
        priority: data.priority as any,
        status: data.status as any,
      },
    });
  }

  async delete(id: string) {
    const repair = await this.prisma.repair.findUnique({ where: { id } });
    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    await this.prisma.repair.delete({ where: { id } });
    return { message: 'Repair deleted successfully' };
  }
}
