import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CompanyType, Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  // ── Driver-only fields ───────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  // ── Student-only fields ──────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;
}
