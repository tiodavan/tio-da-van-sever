import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsDateString()
  date: string;
}
