import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDoctorDto, RegisterStaffDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService,
  ){}

  async login(loginDto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // Tạo JWT token thật
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    return this.registerUser(dto, Role.DOCTOR, 'Tài khoản bác sĩ');
  }

  async registerStaff(dto: RegisterStaffDto) {
    return this.registerUser(dto, Role.STAFF, 'Tài khoản nhân viên');
  }

  private async registerUser(dto: any, role: Role, type: string) {
    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExists) throw new BadRequestException('Email đã tồn tại!');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { ...dto, password: hashedPassword, role } });
    return { message: `${type} được tạo thành công`, userId: user.id };
  }
  async changePassword(userId: number, body: any) {
    const { oldPassword, newPassword } = body;

    // 1. Tìm user trong DB
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');

    // 2. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu cũ không chính xác');

    // 3. Hash mật khẩu mới và lưu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}