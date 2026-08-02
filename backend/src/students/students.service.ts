import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = query?.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { studentId: { contains: query.search } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: { user: true, room: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data: students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true, room: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByStudentId(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: { user: true, room: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByRoom(roomId: string) {
    return this.prisma.student.findMany({
      where: { roomId },
      include: { user: true },
    });
  }

  async create(data: { studentId: string; name: string; roomId: string; userId: number }) {
    return this.prisma.student.create({
      data: {
        ...data,
        dormScore: 100,
      },
      include: { user: true, room: true },
    });
  }

  async update(id: string, data: { studentId?: string; name?: string; roomId?: string }) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.student.update({
      where: { id },
      data,
      include: { user: true, room: true },
    });
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }
}
