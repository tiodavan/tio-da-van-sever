import { Injectable, Logger } from '@nestjs/common';
import { DriverStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDriversDto } from './dto/search-drivers.dto';
import { DriverListingResponseDto } from './dto/driver-listing-response.dto';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async searchDrivers(
    filters: SearchDriversDto,
  ): Promise<DriverListingResponseDto[]> {
    const minRating = filters.min_rating
      ? parseFloat(filters.min_rating)
      : undefined;

    this.logger.log(`Marketplace search — filters: ${JSON.stringify(filters)}`);

    const drivers = await this.prisma.driver.findMany({
      where: {
        status: DriverStatus.active,
        routes: {
          some: {
            active: true,
            ...(filters.school && {
              destination: { contains: filters.school, mode: 'insensitive' },
            }),
            ...(filters.neighborhood && {
              origin: {
                contains: filters.neighborhood,
                mode: 'insensitive',
              },
            }),
            ...(filters.time && { departureTime: filters.time }),
          },
        },
      },
      include: {
        user: { select: { name: true, phone: true } },
        routes: {
          where: {
            active: true,
            ...(filters.school && {
              destination: { contains: filters.school, mode: 'insensitive' },
            }),
            ...(filters.neighborhood && {
              origin: {
                contains: filters.neighborhood,
                mode: 'insensitive',
              },
            }),
            ...(filters.time && { departureTime: filters.time }),
          },
          select: {
            id: true,
            origin: true,
            destination: true,
            departureTime: true,
            weekdays: true,
            slots: true,
          },
        },
        reviews: { select: { rating: true } },
      },
    });

    const results: DriverListingResponseDto[] = [];

    for (const driver of drivers) {
      const totalReviews = driver.reviews.length;
      const averageRating =
        totalReviews > 0
          ? driver.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : null;

      if (
        minRating !== undefined &&
        (averageRating === null || averageRating < minRating)
      ) {
        continue;
      }

      results.push(
        DriverListingResponseDto.from(
          {
            userId: driver.userId,
            status: driver.status,
            user: driver.user,
            routes: driver.routes,
          },
          averageRating,
          totalReviews,
        ),
      );
    }

    this.logger.log(`Marketplace search returned ${results.length} driver(s)`);

    return results;
  }
}
