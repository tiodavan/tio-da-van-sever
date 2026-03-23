import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchDriversDto {
  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumberString()
  min_rating?: string;
}
