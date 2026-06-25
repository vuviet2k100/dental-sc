import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { AppointmentStatus, ServiceType, AppointmentSource } from '@prisma/client';

export class CreateAppointmentDto {
  @IsNumber()
  patientId?: number;

  @IsNumber()
  doctorId?: number;

  @IsDateString()
  appointmentTime!: string;

  @IsEnum(ServiceType)
  service?: ServiceType;

  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  teleName?: string;

  @IsString()
  @IsOptional()
  teleNote?: string;

  @IsString()
  @IsOptional()
  saleNote?: string;

  @IsNumber()
  @IsOptional()
  revenue?: number;
}