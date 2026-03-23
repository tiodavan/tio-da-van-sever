import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TripEventsService } from './trip-events.service';
import { CreateTripEventDto } from './dto/create-trip-event.dto';
import { TripEventResponseDto } from './dto/trip-event-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('trips/:tripId/events')
export class TripEventsController {
  constructor(private readonly tripEventsService: TripEventsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
    @Body() dto: CreateTripEventDto,
  ): Promise<TripEventResponseDto> {
    return this.tripEventsService.create(user.uid, tripId, dto);
  }

  @Get()
  findAll(@Param('tripId') tripId: string): Promise<TripEventResponseDto[]> {
    return this.tripEventsService.findByTrip(tripId);
  }
}
