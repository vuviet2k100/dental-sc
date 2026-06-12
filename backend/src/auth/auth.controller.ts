import { Controller, Post, Body, UseGuards, Get, Req, Patch, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDoctorDto, RegisterStaffDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/role.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  // THÊM ĐOẠN NÀY ĐỂ FIX LỖI 404
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    return this.authService.changePassword(req.user.id, body);
  }

  @Post('register/doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.authService.registerDoctor(dto);
  }

  @Post('register/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  registerStaff(@Body() dto: RegisterStaffDto) {
    return this.authService.registerStaff(dto);
  }
}