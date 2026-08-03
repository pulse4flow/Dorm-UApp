import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const MAX_STUDENTS = 3;
const MAX_MANAGERS = 2;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { student: { include: { room: true } } },
      orderBy: { id: 'asc' },
    });

    return users.map((u) => this.format(u));
  }

  async create(data: {
    username: string;
    password: string;
    name: string;
    role: string;
    roomId?: string;
    dormScore?: number;
    studentId?: string;
  }) {
    const username = data.username?.trim().toLowerCase();
    if (!username || !data.password || !data.name) {
      throw new BadRequestException('Username, password, and name are required.');
    }

    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new ConflictException('Username already exists.');
    }

    if (data.role === 'student') {
      const count = await this.prisma.user.count({ where: { role: 'student' } });
      if (count >= MAX_STUDENTS) {
        throw new ConflictException(`Student limit reached (max ${MAX_STUDENTS}).`);
      }
    } else if (data.role === 'manager') {
      const count = await this.prisma.user.count({ where: { role: 'manager' } });
      if (count >= MAX_MANAGERS) {
        throw new ConflictException(`Manager limit reached (max ${MAX_MANAGERS}).`);
      }
    } else {
      throw new BadRequestException('Role must be student or manager.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        type: data.role === 'manager' ? 'staff' : 'student',
      },
    });

    if (data.role === 'student') {
      let roomId = data.roomId || 'A-101';
      let room = await this.prisma.room.findFirst({
        where: { OR: [{ id: roomId }, { roomNumber: roomId }] },
      });
      if (!room) {
        const roomNum = roomId;
        room = await this.prisma.room.create({
          data: {
            roomNumber: roomNum,
            building: roomNum.split('-')[0] || 'A',
            floor: parseInt(roomNum.split('-')[1]?.[0] || '1', 10) || 1,
            status: 'occupied',
          },
        });
      }

      const score = data.dormScore !== undefined ? Math.min(100, Math.max(0, Number(data.dormScore))) : 100;

      const studentId = (data.studentId || '').trim() || username;
      const existingStudentId = await this.prisma.student.findUnique({ where: { studentId } });
      if (existingStudentId) {
        throw new ConflictException('Student ID already exists.');
      }

      const student = await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          name: data.name,
          roomId: room.id,
          dormScore: score,
        },
        include: { room: true },
      });

      return this.format({ ...user, student });
    }

    return this.format(user);
  }

  async update(
    id: number,
    data: {
      name?: string;
      roomId?: string;
      dormScore?: number;
      role?: string;
      studentId?: string;
      password?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isStudent = user.role === 'student' && !!user.student;
    const targetRole = data.role || user.role;

    if (targetRole !== user.role) {
      if (targetRole === 'manager') {
        const count = await this.prisma.user.count({ where: { role: 'manager' } });
        if (count >= MAX_MANAGERS) {
          throw new ConflictException(`Manager limit reached (max ${MAX_MANAGERS}).`);
        }
      } else if (targetRole === 'student') {
        const count = await this.prisma.user.count({ where: { role: 'student' } });
        if (count >= MAX_STUDENTS) {
          throw new ConflictException(`Student limit reached (max ${MAX_STUDENTS}).`);
        }
      }
    }

    if (data.password && data.password.trim()) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    }

    if (data.role && data.role !== 'student' && data.role !== 'manager') {
      throw new BadRequestException('Role must be student or manager.');
    }

    if (targetRole !== user.role) {
      if (targetRole === 'manager') {
        await this.prisma.student.deleteMany({ where: { userId: id } });
        await this.prisma.user.update({
          where: { id },
          data: {
            role: 'manager',
            type: 'staff',
            ...(data.name && { name: data.name }),
          },
        });
      } else {
        const studentId = (data.studentId || '').trim() || user.username;
        const existingStudentId = await this.prisma.student.findUnique({ where: { studentId } });
        if (existingStudentId && existingStudentId.userId !== id) {
          throw new ConflictException('Student ID already exists.');
        }

        let roomId = data.roomId || 'A-101';
        let room = await this.prisma.room.findFirst({
          where: { OR: [{ id: roomId }, { roomNumber: roomId }] },
        });
        if (!room) {
          const roomNum = roomId;
          room = await this.prisma.room.create({
            data: {
              roomNumber: roomNum,
              building: roomNum.split('-')[0] || 'A',
              floor: parseInt(roomNum.split('-')[1]?.[0] || '1', 10) || 1,
              status: 'occupied',
            },
          });
        }

        await this.prisma.user.update({
          where: { id },
          data: {
            role: 'student',
            type: 'student',
            ...(data.name && { name: data.name }),
          },
        });

        await this.prisma.student.create({
          data: {
            userId: id,
            studentId,
            name: data.name || user.name || '',
            roomId: room.id,
            dormScore: 100,
          },
        });
      }
    } else {
      const nameUpdate: any = {};
      if (data.name) nameUpdate.name = data.name;

      await this.prisma.user.update({
        where: { id },
        data: nameUpdate,
      });

      if (isStudent && user.student) {
        let targetRoomId = user.student.roomId;
        if (data.roomId) {
          let room = await this.prisma.room.findFirst({
            where: { OR: [{ id: data.roomId }, { roomNumber: data.roomId }] },
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

        const score =
          data.dormScore !== undefined ? Math.min(100, Math.max(0, Number(data.dormScore))) : undefined;

        const studentUpdate: any = {
          ...(data.name && { name: data.name }),
          ...(score !== undefined && { dormScore: score }),
          roomId: targetRoomId,
        };

        if (data.studentId && data.studentId.trim()) {
          const newStudentId = data.studentId.trim();
          const existingStudentId = await this.prisma.student.findUnique({ where: { studentId: newStudentId } });
          if (existingStudentId && existingStudentId.userId !== id) {
            throw new ConflictException('Student ID already exists.');
          }
          studentUpdate.studentId = newStudentId;
        }

        await this.prisma.student.update({
          where: { userId: id },
          data: studentUpdate,
        });
      }
    }

    const refreshed = await this.prisma.user.findUnique({
      where: { id },
      include: { student: { include: { room: true } } },
    });
    return this.format(refreshed!);
  }

  async delete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  private format(user: any) {
    const studentObj = user.student;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      type: user.type || (user.role === 'manager' ? 'staff' : 'student'),
      studentId: studentObj?.studentId || null,
      roomId: studentObj?.roomId || null,
      roomNumber: studentObj?.room?.roomNumber || studentObj?.roomId || null,
      dormScore: studentObj?.dormScore ?? (user.role === 'manager' ? null : 100),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
