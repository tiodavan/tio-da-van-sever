import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllForDriver(driverUserId: string): Promise<RouteResponseDto[]> {
    const routes = await this.prisma.route.findMany({
      where: { driverId: driverUserId },
      orderBy: { departureTime: 'asc' },
    });
    return routes.map((r) => RouteResponseDto.from(r));
  }

  async create(
    driverUserId: string,
    dto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    this.logger.log(`Creating route for driver userId=${driverUserId}`);

    const route = await this.prisma.route.create({
      data: { ...dto, driverId: driverUserId },
    });

    return RouteResponseDto.from(route);
  }

  async update(
    driverUserId: string,
    routeId: string,
    dto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    await this.assertOwnership(driverUserId, routeId);

    this.logger.log(
      `Updating route id=${routeId} for driver userId=${driverUserId}`,
    );

    const route = await this.prisma.route.update({
      where: { id: routeId },
      data: dto,
    });

    return RouteResponseDto.from(route);
  }

  async remove(driverUserId: string, routeId: string): Promise<void> {
    await this.assertOwnership(driverUserId, routeId);

    this.logger.log(
      `Deleting route id=${routeId} for driver userId=${driverUserId}`,
    );

    await this.prisma.route.update({
      where: { id: routeId },
      data: { active: false },
    });
  }

  private async assertOwnership(
    driverUserId: string,
    routeId: string,
  ): Promise<void> {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException(`Route ${routeId} not found`);
    }

    if (route.driverId !== driverUserId) {
      throw new ForbiddenException('This route does not belong to you');
    }
  }
}
