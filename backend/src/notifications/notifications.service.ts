import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cacheService } from '../common/cache.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, query?: { isRead?: boolean; type?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query?.isRead !== undefined) where.isRead = query.isRead;
    if (query?.type) where.type = query.type;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data: notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCounts(userId: number) {
    const cacheKey = `notifications:counts:${userId}`;
    const cached = cacheService.get<{ total: number; unread: number; byType: Record<string, number> }>(cacheKey);
    if (cached) return cached;

    const where = { userId };

    const [total, unread] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, isRead: false } }),
    ]);

    const byType = await this.prisma.notification.groupBy({
      by: ['type'],
      where,
      _count: { type: true },
    });

    const typeCounts = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const result = { total, unread, byType: typeCounts };
    cacheService.set(cacheKey, result, 30000); // Cache for 30 seconds
    return result;
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async create(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        type: data.type as any,
      },
    });
  }

  async delete(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  }

  async deleteAll(userId: number) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { message: 'All notifications deleted' };
  }
}
