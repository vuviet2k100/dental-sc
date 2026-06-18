import { IsString, IsNotEmpty, IsOptional, IsISO8601, IsPhoneNumber, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client'
export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  name!: string;

  @IsPhoneNumber('VN', { message: 'Số điện thoại không đúng định dạng tại Việt Nam' })
  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  phone!: string;

  @IsISO8601({}, { message: 'Ngày sinh phải ở định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Ngày sinh là bắt buộc' })
  birthDate!: string; // Chuyển từ frontend lên dưới dạng chuỗi ISO

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender; // Ví dụ: 'Nam', 'Nữ', 'Khác'

  @IsString()
  @IsOptional()
  address?: string; // Địa chỉ không bắt buộc
}