import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NewRecordDto {
  @IsString() @IsNotEmpty() diagnosis!: string;
  @IsString() @IsNotEmpty() treatment!: string;
  @IsString() @IsOptional() note?: string;
  @Type(() => Number) @IsNumber() @IsNotEmpty() patientId!: number;
  @Type(() => Number) @IsNumber() @IsNotEmpty() doctorId!: number;
  @Type(() => Number) @IsNumber() @IsNotEmpty() appointmentId!: number;
}