import { Vehicle } from '@prisma/client';

export class VehicleResponseDto {
  id: string;
  driverId: string;
  make: string;
  model: string;
  color: string;
  year: number;
  plate: string;
  capacity: number;

  static from(vehicle: Vehicle): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = vehicle.id;
    dto.driverId = vehicle.driverId;
    dto.make = vehicle.make;
    dto.model = vehicle.model;
    dto.color = vehicle.color;
    dto.year = vehicle.year;
    dto.plate = vehicle.plate;
    dto.capacity = vehicle.capacity;
    return dto;
  }
}
