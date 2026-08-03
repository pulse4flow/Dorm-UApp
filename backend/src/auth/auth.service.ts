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

  async login(identifier: string, password: string, role?: string) {
    const isManagerAttempt = role === 'manager' || (identifier && identifier.includes('@'));
    const defaultErrMsg = isManagerAttempt ? 'Invalid email or password.' : 'Invalid Student ID or Password.';

    if (!identifier || !password) {
      throw new UnauthorizedException(defaultErrMsg);
    }

    const trimmedIdentifier = identifier.trim();
    let user: any = null;

    if (role === 'manager') {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: trimmedIdentifier.toLowerCase() },
            { email: trimmedIdentifier },
          ],
        },
        include: { student: { include: { room: true } } },
      });
      if (!user || (user.role !== 'manager' && user.type !== 'manager' && user.type !== 'staff')) {
        throw new UnauthorizedException('Invalid email or password.');
      }
    } else if (role === 'student') {
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

      if (studentRecord?.user) {
        user = await this.prisma.user.findUnique({
          where: { id: studentRecord.user.id },
          include: { student: { include: { room: true } } },
        });
      }

      if (!user) {
        user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email: trimmedIdentifier.toLowerCase() },
              { email: trimmedIdentifier },
            ],
            role: 'student',
          },
          include: { student: { include: { room: true } } },
        });
      }

      if (!user) {
        throw new UnauthorizedException('Invalid Student ID or Password.');
      }
    } else {
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

      if (studentRecord?.user) {
        user = await this.prisma.user.findUnique({
          where: { id: studentRecord.user.id },
          include: { student: { include: { room: true } } },
        });
      }

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
        throw new UnauthorizedException(defaultErrMsg);
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const errMsg = (user.role === 'manager' || user.type === 'manager' || isManagerAttempt)
        ? 'Invalid email or password.'
        : 'Invalid Student ID or Password.';
      throw new UnauthorizedException(errMsg);
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
        type: data.role === 'manager' ? 'manager' : 'student',
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
    const isManager = user.role === 'manager' || user.type === 'manager' || user.type === 'staff';
    const payload = {
      sub: user.id,
      email: user.email,
      role: isManager ? 'manager' : 'student',
      type: isManager ? 'manager' : 'student',
    };
    return this.jwtService.sign(payload, { expiresIn: '48h' });
  }

  private formatUserProfile(user: any) {
    const studentObj = user.student;
    const isManager = user.role === 'manager' || user.type === 'manager' || user.type === 'staff';
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: isManager ? 'manager' : (user.role || 'student'),
      type: isManager ? 'manager' : (user.type || 'student'),
      studentId: isManager ? null : (studentObj?.studentId || null),
      room: isManager ? null : (studentObj?.room?.roomNumber || studentObj?.roomId || null),
      dormScore: isManager ? null : (studentObj?.dormScore ?? 100),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
