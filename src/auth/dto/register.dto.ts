import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CompanyType, Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fcmToken?: string;

  // ── Driver-only fields ───────────────────────────────────────────────────

  @ValidateIf((o: RegisterDto) => o.role === Role.driver)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId?: string;

  @ValidateIf((o: RegisterDto) => o.role === Role.driver)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  legalName?: string;

  @ValidateIf((o: RegisterDto) => o.role === Role.driver)
  @IsEnum(CompanyType)
  @IsNotEmpty()
  companyType?: CompanyType;

  // ── Student-only fields ──────────────────────────────────────────────────

  @ValidateIf((o: RegisterDto) => o.role === Role.driver)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  school?: string;

  @ValidateIf((o: RegisterDto) => o.role === Role.student)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  pickupAddress?: string;
}
