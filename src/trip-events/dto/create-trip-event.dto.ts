import { IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';
import { TripEventType } from '@prisma/client';

export class CreateTripEventDto {
  @IsEnum(TripEventType)
  type: TripEventType;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsDecimal()
  lat?: string;

  @IsOptional()
  @IsDecimal()
  lng?: string;
}
