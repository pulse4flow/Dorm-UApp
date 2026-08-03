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
      throw new UnauthorizedException('Invalid User ID or Password.');
    }

    const trimmedIdentifier = identifier.trim();

    let user: any = null;

    // 1. First search by username (primary login identifier)
    const usernameUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedIdentifier },
          { username: trimmedIdentifier.toLowerCase() },
        ],
      },
      include: { student: { include: { room: true } } },
    });

    if (usernameUser) {
      user = usernameUser;
    } else {
      // 2. Fallback: search by Student ID in Student table (STU-xxx)
      const studentRecord = await this.prisma.student.findFirst({
        where: {
          OR: [
            { studentId: trimmedIdentifier },
            { studentId: trimmedIdentifier.toUpperCase() },
            { studentId: `STU-${trimmedIdentifier}` },
          ],
        },
        include: { user: true },
      });

      if (studentRecord?.user) {
        user = await this.prisma.user.findUnique({
          where: { id: studentRecord.user.id },
          include: { student: { include: { room: true } } },
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid User ID or Password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid User ID or Password.');
    }

    const token = this.generateToken(user);
    const userProfile = this.formatUserProfile(user);

    return { user: userProfile, token };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    if (!oldPassword || !newPassword) {
      throw new UnauthorizedException('Old and new password are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (newPassword.length < 4) {
      throw new UnauthorizedException('New password must be at least 4 characters.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
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

  async updateProfile(userId: number, data: { name?: string }) {
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
    const payload = { sub: user.id, username: user.username, role: user.role, type: user.type || 'student' };
    return this.jwtService.sign(payload, { expiresIn: '48h' });
  }

  private formatUserProfile(user: any) {
    const studentObj = user.student;
    return {
      id: user.id,
      username: user.username,
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
