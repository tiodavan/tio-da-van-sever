import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { OptimizedRouteResponseDto } from './dto/optimized-route-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ): Promise<TripResponseDto[]> {
    return this.tripsService.findAllForDriver(user.uid, date);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTripDto,
  ): Promise<TripResponseDto> {
    return this.tripsService.create(user.uid, dto);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  startTrip(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<TripResponseDto> {
    return this.tripsService.startTrip(user.uid, id);
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  endTrip(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<TripResponseDto> {
    return this.tripsService.endTrip(user.uid, id);
  }

  @Get(':id/route')
  getOptimizedRoute(
    @Param('id') id: string,
  ): Promise<OptimizedRouteResponseDto> {
    return this.tripsService.getOptimizedRoute(id);
  }
}
