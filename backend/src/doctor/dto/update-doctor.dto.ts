import { PartialType } from '@nestjs/mapped-types';
import { RegisterDoctorDto } from './create-doctor.dto'; // <-- Phải import file này mới đúng

export class UpdateDoctorDto extends PartialType(RegisterDoctorDto) {}