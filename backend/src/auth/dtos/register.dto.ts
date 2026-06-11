import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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
  role?: string; // Mặc định sẽ là 'DOCTOR' trong service, nhưng có thể thêm vào đây nếu muốn tùy chỉnh  
  
  // Thêm ! nếu cột này bắt buộc trong DB, hoặc đổi thành ? nếu cấu hình nullable
  @IsOptional()
  //@IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone!: string; 

  @IsOptional()
  //@IsNotEmpty({ message: 'Chuyên khoa không được để trống' })
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
  role?: string; // Mặc định sẽ là 'STAFF' trong service, nhưng có thể thêm vào đây nếu muốn tùy chỉnh

  @IsOptional()
  //@IsNotEmpty({ message: 'Vị trí công việc không được để trống' })
  position!: string; 
}