import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.status === 'upcoming') {
      where.startTime = { gt: new Date() };
    } else if (query?.status === 'ongoing') {
      where.startTime = { lte: new Date() };
      where.endTime = { gte: new Date() };
    } else if (query?.status === 'completed') {
      where.endTime = { lt: new Date() };
    }

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: {
          participants: {
            include: { student: { select: { id: true, studentId: true, name: true } } },
          },
          _count: { select: { participants: true } },
        },
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data: activities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUpcoming(limit: number = 5) {
    return this.prisma.activity.findMany({
      where: { startTime: { gt: new Date() } },
      include: {
        participants: {
          include: { student: { select: { id: true, studentId: true, name: true } } },
        },
        _count: { select: { participants: true } },
      },
      take: limit,
      orderBy: { startTime: 'asc' },
    });
  }

  async findMyActivities(studentId: string) {
    return this.prisma.activity.findMany({
      where: {
        participants: {
          some: { studentId },
        },
      },
      include: {
        participants: {
          include: { student: { select: { id: true, studentId: true, name: true } } },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        participants: {
          include: { student: { select: { id: true, studentId: true, name: true } } },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async create(data: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    maxParticipants?: number;
    createdBy: number;
  }) {
    return this.prisma.activity.create({
      data,
      include: { _count: { select: { participants: true } } },
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
    maxParticipants?: number;
  }) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return this.prisma.activity.update({
      where: { id },
      data,
      include: { _count: { select: { participants: true } } },
    });
  }

  async join(activityId: string, studentId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { participants: true } } },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.maxParticipants && activity._count.participants >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    const existingParticipation = await this.prisma.activityParticipant.findUnique({
      where: { activityId_studentId: { activityId, studentId } },
    });

    if (existingParticipation) {
      throw new BadRequestException('Already joined this activity');
    }

    return this.prisma.activityParticipant.create({
      data: { activityId, studentId },
    });
  }

  async leave(activityId: string, studentId: string) {
    const participation = await this.prisma.activityParticipant.findUnique({
      where: { activityId_studentId: { activityId, studentId } },
    });

    if (!participation) {
      throw new NotFoundException('Not participating in this activity');
    }

    await this.prisma.activityParticipant.delete({
      where: { activityId_studentId: { activityId, studentId } },
    });

    return { message: 'Left activity successfully' };
  }

  async getParticipants(activityId: string) {
    return this.prisma.activityParticipant.findMany({
      where: { activityId },
      include: { student: { select: { id: true, studentId: true, name: true } } },
    });
  }

  async delete(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    await this.prisma.activity.delete({ where: { id } });
    return { message: 'Activity deleted successfully' };
  }
}
