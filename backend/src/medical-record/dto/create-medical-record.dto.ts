import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  diagnosis!: string;

  @IsString()
  treatment!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsInt()
  patientId!: number;

  @IsInt()
  appointmentId!: number;

  @IsOptional()
  @IsInt()
  doctorId!: number;

  @IsOptional()
  @IsArray()
  images?: string[]; 
}