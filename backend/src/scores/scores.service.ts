import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cacheService } from '../common/cache.service';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  async getMyScore(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      id: student.id,
      studentId: student.studentId,
      score: student.dormScore,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  async getStudentScore(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      id: student.id,
      studentId: student.studentId,
      score: student.dormScore,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  async getMyHistory(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const cacheKey = `scores:history:${student.id}`;
    const cached = cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const history = await this.prisma.scoreHistory.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    cacheService.set(cacheKey, history, 30000); // Cache for 30 seconds
    return history;
  }

  async getHistory(query?: { studentId?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where = query?.studentId ? { studentId: query.studentId } : {};

    const [history, total] = await Promise.all([
      this.prisma.scoreHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.scoreHistory.count({ where }),
    ]);

    return { data: history, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getHistoryByStudent(studentId: string) {
    return this.prisma.scoreHistory.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adjustScore(data: { studentId: string; score: number; reason: string; changedBy: string }) {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const previousScore = student.dormScore;
    const newScore = Math.max(0, Math.min(100, previousScore + data.score));

    await this.prisma.student.update({
      where: { id: data.studentId },
      data: { dormScore: newScore },
    });

    return this.prisma.scoreHistory.create({
      data: {
        studentId: data.studentId,
        studentName: student.name,
        previousScore,
        newScore,
        reason: data.reason,
        changedBy: data.changedBy,
      },
    });
  }

  async getAll(query?: { page?: number; limit?: number; sortBy?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        select: {
          id: true,
          studentId: true,
          dormScore: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { dormScore: query?.sortBy === 'asc' ? 'asc' : 'desc' },
      }),
      this.prisma.student.count(),
    ]);

    return { data: students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStats() {
    const cached = cacheService.get<{ average: number; highest: number; lowest: number; total: number }>('scores:stats');
    if (cached) return cached;

    const result = await this.prisma.student.aggregate({
      _avg: { dormScore: true },
      _max: { dormScore: true },
      _min: { dormScore: true },
      _count: { dormScore: true },
    });

    const stats = {
      average: result._avg.dormScore || 0,
      highest: result._max.dormScore || 0,
      lowest: result._min.dormScore || 0,
      total: result._count.dormScore || 0,
    };

    cacheService.set('scores:stats', stats, 30000);
    return stats;
  }
}
