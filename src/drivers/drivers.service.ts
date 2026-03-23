import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverResponseDto } from './dto/driver-response.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverDocumentsDto } from './dto/update-driver-documents.dto';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMe(driverUserId: string): Promise<DriverResponseDto> {
    const driver = await this.findDriverOrThrow(driverUserId);
    return DriverResponseDto.from(driver);
  }

  async updateMe(
    driverUserId: string,
    dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    await this.findDriverOrThrow(driverUserId);

    this.logger.log(`Updating driver profile for userId=${driverUserId}`);

    await this.prisma.user.update({
      where: { id: driverUserId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });

    return this.findMe(driverUserId);
  }

  async updateDocuments(
    driverUserId: string,
    dto: UpdateDriverDocumentsDto,
  ): Promise<DriverResponseDto> {
    await this.findDriverOrThrow(driverUserId);

    this.logger.log(`Updating documents for driver userId=${driverUserId}`);

    await this.prisma.driver.update({
      where: { userId: driverUserId },
      data: {
        ...(dto.licenseUrl !== undefined && { licenseUrl: dto.licenseUrl }),
        ...(dto.vehicleRegUrl !== undefined && {
          vehicleRegUrl: dto.vehicleRegUrl,
        }),
        ...(dto.bgCheckUrl !== undefined && { bgCheckUrl: dto.bgCheckUrl }),
      },
    });

    return this.findMe(driverUserId);
  }

  async updateStatus(
    driverUserId: string,
    dto: UpdateDriverStatusDto,
  ): Promise<DriverResponseDto> {
    await this.findDriverOrThrow(driverUserId);

    this.logger.log(
      `Updating status for driver userId=${driverUserId} → ${dto.status}`,
    );

    await this.prisma.driver.update({
      where: { userId: driverUserId },
      data: { status: dto.status },
    });

    return this.findMe(driverUserId);
  }

  private async findDriverOrThrow(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        user: { include: { roles: true } },
        company: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver not found for userId=${userId}`);
    }

    return driver;
  }
}
