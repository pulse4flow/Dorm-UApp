import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepairsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: string; category?: string; page?: number; limit?: number; search?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.category) where.category = query.category;
    if (query?.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { student: { name: { contains: query.search, mode: 'insensitive' } } },
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
    const [total, pending, inProgress, resolved] = await Promise.all([
      this.prisma.repair.count(),
      this.prisma.repair.count({ where: { status: 'pending' } }),
      this.prisma.repair.count({ where: { status: 'in_progress' } }),
      this.prisma.repair.count({ where: { status: 'resolved' } }),
    ]);

    return { total, pending, inProgress, resolved };
  }

  async findByStudent(studentId: string) {
    return this.prisma.repair.findMany({
      where: { studentId },
      include: { room: { select: { id: true, roomNumber: true, building: true } } },
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
    return this.prisma.repair.create({
      data: {
        ...data,
        category: data.category as any,
        priority: (data.priority as any) || 'medium',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const repair = await this.prisma.repair.findUnique({ where: { id } });
    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    return this.prisma.repair.update({
      where: { id },
      data: { status: status as any },
    });
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
