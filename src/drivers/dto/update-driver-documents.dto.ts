import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateDriverDocumentsDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  licenseUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  vehicleRegUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  bgCheckUrl?: string;
}
