import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllForDriver(driverUserId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { driverId: driverUserId },
    });
    return vehicles.map((v) => VehicleResponseDto.from(v));
  }

  async create(
    driverUserId: string,
    dto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    this.logger.log(`Creating vehicle for driver userId=${driverUserId}`);

    const vehicle = await this.prisma.vehicle.create({
      data: { ...dto, driverId: driverUserId },
    });

    return VehicleResponseDto.from(vehicle);
  }

  async update(
    driverUserId: string,
    vehicleId: string,
    dto: Partial<CreateVehicleDto>,
  ): Promise<VehicleResponseDto> {
    await this.assertOwnership(driverUserId, vehicleId);

    this.logger.log(
      `Updating vehicle id=${vehicleId} for driver userId=${driverUserId}`,
    );

    const vehicle = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: dto,
    });

    return VehicleResponseDto.from(vehicle);
  }

  async remove(driverUserId: string, vehicleId: string): Promise<void> {
    await this.assertOwnership(driverUserId, vehicleId);

    this.logger.log(
      `Deleting vehicle id=${vehicleId} for driver userId=${driverUserId}`,
    );

    await this.prisma.vehicle.delete({ where: { id: vehicleId } });
  }

  private async assertOwnership(
    driverUserId: string,
    vehicleId: string,
  ): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }

    if (vehicle.driverId !== driverUserId) {
      throw new ForbiddenException('This vehicle does not belong to you');
    }
  }
}
