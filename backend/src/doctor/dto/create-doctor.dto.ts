import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDoctorDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bác sĩ không được để trống' })
  name!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  // BỔ SUNG TRƯỜNG PASSWORD ĐỂ ĐĂNG NHẬP
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password!: string;
}