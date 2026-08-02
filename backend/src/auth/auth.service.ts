import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(identifier: string, password: string) {
    if (!identifier || !password) {
      throw new UnauthorizedException('Invalid Student ID or Password.');
    }

    const trimmedIdentifier = identifier.trim();

    // 1. First search by Student ID in Student table
    const studentRecord = await this.prisma.student.findFirst({
      where: {
        OR: [
          { studentId: trimmedIdentifier },
          { studentId: trimmedIdentifier.toUpperCase() },
          { studentId: `STU-${trimmedIdentifier}` },
        ],
      },
      include: { user: true, room: true },
    });

    let user: any = null;

    if (studentRecord?.user) {
      // Found via student lookup – reload the full user with nested student+room
      user = await this.prisma.user.findUnique({
        where: { id: studentRecord.user.id },
        include: { student: { include: { room: true } } },
      });
    }

    // 2. If not found by studentId, search by email in User table
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: trimmedIdentifier.toLowerCase() },
            { email: trimmedIdentifier },
            { name: trimmedIdentifier },
          ],
        },
        include: { student: { include: { room: true } } },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid Student ID or Password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Student ID or Password.');
    }

    const token = this.generateToken(user);
    const userProfile = this.formatUserProfile(user);

    return { user: userProfile, token };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    studentId?: string;
    roomId?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: (data.role as any) || 'student',
        type: data.role === 'manager' ? 'staff' : 'student',
      },
    });

    if (data.role !== 'manager' && data.studentId) {
      let roomId = data.roomId || 'A-101';
      let room = await this.prisma.room.findFirst({
        where: { OR: [{ id: roomId }, { roomNumber: roomId }] },
      });
      if (!room) {
        room = await this.prisma.room.create({
          data: {
            roomNumber: roomId,
            building: roomId.split('-')[0] || 'A',
            floor: parseInt(roomId.split('-')[1]?.[0] || '1', 10) || 1,
            status: 'occupied',
          },
        });
      }

      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId: data.studentId,
          name: data.name,
          roomId: room.id,
          dormScore: 100,
        },
      });
    }

    const token = this.generateToken(user);
    const userProfile = this.formatUserProfile(user);

    return { user: userProfile, token };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: { include: { room: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.formatUserProfile(user);
  }

  async updateProfile(userId: number, data: { name?: string; email?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { student: { include: { room: true } } },
    });

    return this.formatUserProfile(user);
  }

  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: { include: { room: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken(user);
    return { token };
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, type: user.type || 'student' };
    return this.jwtService.sign(payload, { expiresIn: '48h' });
  }

  private formatUserProfile(user: any) {
    const studentObj = user.student;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: user.type || (user.role === 'manager' ? 'staff' : 'student'),
      studentId: studentObj?.studentId || null,
      room: studentObj?.room?.roomNumber || studentObj?.roomId || null,
      dormScore: studentObj?.dormScore ?? (user.role === 'manager' ? null : 100),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
