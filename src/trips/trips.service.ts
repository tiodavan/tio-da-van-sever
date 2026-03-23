import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TripStatus } from '@prisma/client';
import axios from 'axios';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { OptimizedRouteResponseDto } from './dto/optimized-route-response.dto';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  async findAllForDriver(
    driverUserId: string,
    date?: string,
  ): Promise<TripResponseDto[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        route: { driverId: driverUserId },
        ...(date && {
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      orderBy: { date: 'desc' },
    });

    return trips.map((t) => TripResponseDto.from(t));
  }

  async create(
    driverUserId: string,
    dto: CreateTripDto,
  ): Promise<TripResponseDto> {
    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
    });

    if (!route) {
      throw new NotFoundException(`Route ${dto.routeId} not found`);
    }

    if (route.driverId !== driverUserId) {
      throw new ForbiddenException('This route does not belong to you');
    }

    this.logger.log(
      `Creating trip for driver userId=${driverUserId} on route=${dto.routeId}`,
    );

    const trip = await this.prisma.trip.create({
      data: {
        routeId: dto.routeId,
        date: new Date(dto.date),
      },
    });

    return TripResponseDto.from(trip);
  }

  async startTrip(
    driverUserId: string,
    tripId: string,
  ): Promise<TripResponseDto> {
    const trip = await this.findTripOwnedByDriver(driverUserId, tripId);

    if (trip.status !== TripStatus.scheduled) {
      throw new BadRequestException(
        `Trip ${tripId} cannot be started — current status: ${trip.status}`,
      );
    }

    this.logger.log(
      `Starting trip id=${tripId} for driver userId=${driverUserId}`,
    );

    const [updated] = await this.prisma.$transaction([
      this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.active, trackingActive: true },
      }),
      this.prisma.tripEvent.create({
        data: { tripId, type: 'trip_started' },
      }),
    ]);

    return TripResponseDto.from(updated);
  }

  async endTrip(
    driverUserId: string,
    tripId: string,
  ): Promise<TripResponseDto> {
    const trip = await this.findTripOwnedByDriver(driverUserId, tripId);

    if (trip.status !== TripStatus.active) {
      throw new BadRequestException(
        `Trip ${tripId} cannot be ended — current status: ${trip.status}`,
      );
    }

    this.logger.log(
      `Ending trip id=${tripId} for driver userId=${driverUserId}`,
    );

    const [updated] = await this.prisma.$transaction([
      this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.completed, trackingActive: false },
      }),
      this.prisma.tripEvent.create({
        data: { tripId, type: 'trip_ended' },
      }),
    ]);

    // Delete Firebase RT DB location node — fire and forget (non-blocking)
    this.firebaseService.deleteLocationNode(driverUserId).catch((error) => {
      this.logger.error(
        `Failed to delete Firebase RT DB node vans/${driverUserId}: ${(error as Error).message}`,
      );
    });

    return TripResponseDto.from(updated);
  }

  async getOptimizedRoute(tripId: string): Promise<OptimizedRouteResponseDto> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Route optimization unavailable: GOOGLE_MAPS_API_KEY not configured',
      );
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: true,
        presences: {
          where: { confirmed: true },
          include: { student: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    const waypoints = trip.presences.map((p) => p.student.pickupAddress);

    this.logger.log(
      `Fetching optimized route for trip id=${tripId} with ${waypoints.length} waypoint(s)`,
    );

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: trip.route.origin,
            destination: trip.route.destination,
            ...(waypoints.length > 0 && {
              waypoints: `optimize:true|${waypoints.join('|')}`,
            }),
            key: apiKey,
          },
        },
      );

      if (response.data.status !== 'OK') {
        this.logger.error(
          `Google Maps API error for trip ${tripId}: ${response.data.status}`,
        );
        throw new BadGatewayException(
          `Route optimization failed: ${response.data.status}`,
        );
      }

      return OptimizedRouteResponseDto.fromGoogleMapsResponse(response.data);
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      this.logger.error(
        `Google Maps request failed for trip ${tripId}: ${(error as Error).message}`,
      );
      throw new BadGatewayException('Failed to contact Google Maps API');
    }
  }

  private async findTripOwnedByDriver(driverUserId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { route: true },
    });

    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    if (trip.route.driverId !== driverUserId) {
      throw new ForbiddenException('This trip does not belong to you');
    }

    return trip;
  }
}
