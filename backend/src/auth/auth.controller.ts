import { Controller, Post, Get, Put, Body, UseGuards, Request, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const identifier = loginDto.username || loginDto.userId || loginDto.studentId || '';
    return this.authService.login(identifier, loginDto.password);
  }

  // Public self-registration is disabled — user creation is manager-only via /users
  @Post('register')
  async register() {
    throw new ConflictException('Registration is disabled. Please ask a manager to create your account.');
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() data: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id, data.oldPassword, data.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@CurrentUser() user: any, @Body() data: { name?: string }) {
    return this.authService.updateProfile(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }
}
