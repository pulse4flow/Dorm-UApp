import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { type?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where = query?.type ? { type: query.type as any } : {};

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: { author: { select: { id: true, name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { data: announcements, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findLatest(limit: number = 5) {
    return this.prisma.announcement.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async create(data: { title: string; message: string; type: string; createdBy: number }) {
    return this.prisma.announcement.create({
      data: {
        ...data,
        type: data.type as any,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, data: { title?: string; message?: string; type?: string }) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        type: data.type as any,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async delete(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted successfully' };
  }
}
