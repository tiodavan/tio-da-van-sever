import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsString()
  @IsNotEmpty()
  plate: string;

  @IsInt()
  @Min(1)
  capacity: number;
}
