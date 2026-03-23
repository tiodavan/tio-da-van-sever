import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'departureTime must be in HH:MM format',
  })
  departureTime: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  weekdays: string[];

  @IsInt()
  @Min(1)
  slots: number;
}
