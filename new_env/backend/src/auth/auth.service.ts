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

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
      },
    });

    if (data.role === 'student' && data.studentId && data.roomId) {
      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId: data.studentId,
          name: data.name,
          roomId: data.roomId,
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
      include: { student: true },
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
      include: { student: true },
    });

    return this.formatUserProfile(user);
  }

  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken(user);
    return { token };
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: '48h' });
  }

  private formatUserProfile(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      room: user.student?.roomId || null,
      dormScore: user.student?.dormScore || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
