import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 100;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = query?.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { studentId: { contains: query.search, mode: 'insensitive' } },
            { room: { roomNumber: { contains: query.search, mode: 'insensitive' } } },
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
      where: {
        OR: [{ roomId }, { room: { roomNumber: roomId } }],
      },
      include: { user: true, room: true },
    });
  }

  async create(data: {
    studentId: string;
    name: string;
    roomId: string;
    userId?: number;
    email?: string;
    password?: string;
    dormScore?: number;
  }) {
    let room = await this.prisma.room.findFirst({
      where: {
        OR: [{ id: data.roomId }, { roomNumber: data.roomId }],
      },
    });

    if (!room) {
      const roomNum = data.roomId || 'A-101';
      room = await this.prisma.room.create({
        data: {
          roomNumber: roomNum,
          building: roomNum.split('-')[0] || 'A',
          floor: parseInt(roomNum.split('-')[1]?.[0] || '1', 10) || 1,
          status: 'occupied',
        },
      });
    }

    let userId = data.userId;
    if (!userId) {
      const email = data.email || `${data.studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@dorm.com`;
      const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: data.name,
          role: 'student',
          type: 'student',
        },
      });
      userId = user.id;
    }

    const score = data.dormScore !== undefined ? Math.min(100, Math.max(0, Number(data.dormScore))) : 100;

    return this.prisma.student.create({
      data: {
        userId,
        studentId: data.studentId,
        name: data.name,
        roomId: room.id,
        dormScore: score,
      },
      include: { user: true, room: true },
    });
  }

  async update(
    id: string,
    data: {
      studentId?: string;
      name?: string;
      roomId?: string;
      dormScore?: number;
    },
  ) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let targetRoomId = student.roomId;
    if (data.roomId) {
      let room = await this.prisma.room.findFirst({
        where: {
          OR: [{ id: data.roomId }, { roomNumber: data.roomId }],
        },
      });
      if (!room) {
        const roomNum = data.roomId;
        room = await this.prisma.room.create({
          data: {
            roomNumber: roomNum,
            building: roomNum.split('-')[0] || 'A',
            floor: parseInt(roomNum.split('-')[1]?.[0] || '1', 10) || 1,
            status: 'occupied',
          },
        });
      }
      targetRoomId = room.id;
    }

    const score = data.dormScore !== undefined ? Math.min(100, Math.max(0, Number(data.dormScore))) : undefined;

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        ...(data.studentId && { studentId: data.studentId }),
        ...(data.name && { name: data.name }),
        ...(score !== undefined && { dormScore: score }),
        roomId: targetRoomId,
      },
      include: { user: true, room: true },
    });

    if (data.name && updated.userId) {
      await this.prisma.user.update({
        where: { id: updated.userId },
        data: { name: data.name },
      });
    }

    return updated;
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.student.delete({ where: { id } });
    if (student.userId) {
      await this.prisma.user.delete({ where: { id: student.userId } }).catch(() => {});
    }
    return { message: 'Student deleted successfully' };
  }
}
