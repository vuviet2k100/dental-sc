import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Department } from '@prisma/client'; // Nhập Enum từ Prisma

// --- DTO Đăng ký cho Bác sĩ ---
export class RegisterDoctorDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên bác sĩ không được để trống' })
  name!: string;

  @IsString()
  role?: string; 
  
  @IsOptional()
  phone!: string; 

  @IsOptional()
  specialty!: string;
}

// --- DTO Đăng ký cho Nhân viên ---
export class RegisterStaffDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên nhân viên không được để trống' })
  name!: string;

  @IsString()
  role?: string;

  @IsOptional()
  position!: string; 

  // Thêm field bắt buộc cho Staff
  @IsEnum(Department, { message: 'Phòng ban không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng chọn phòng ban cho nhân viên' })
  department!: Department;
}