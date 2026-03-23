import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'departureTime must be in HH:MM format',
  })
  departureTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weekdays?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  slots?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
