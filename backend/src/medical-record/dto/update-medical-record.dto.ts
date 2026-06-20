import { PartialType } from '@nestjs/mapped-types';
import { NewRecordDto } from './new-record.dto';

export class UpdateMedicalRecordDto extends PartialType(NewRecordDto) {}