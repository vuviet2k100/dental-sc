import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  appointmentTime!: string; // Nhận chuỗi ISO từ datetime-local

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsNumber()
  patientId!: number;

  @IsNotEmpty()
  @IsNumber()
  doctorId!: number;
}