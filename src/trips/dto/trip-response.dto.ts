import { Trip, TripStatus } from '@prisma/client';

export class TripResponseDto {
  id: string;
  routeId: string;
  date: Date;
  status: TripStatus;
  trackingActive: boolean;
  createdAt: Date;

  static from(trip: Trip): TripResponseDto {
    const dto = new TripResponseDto();
    dto.id = trip.id;
    dto.routeId = trip.routeId;
    dto.date = trip.date;
    dto.status = trip.status;
    dto.trackingActive = trip.trackingActive;
    dto.createdAt = trip.createdAt;
    return dto;
  }
}
