import { TripEvent, TripEventType } from '@prisma/client';

export class TripEventResponseDto {
  id: string;
  tripId: string;
  studentId: string | null;
  type: TripEventType;
  lat: string | null;
  lng: string | null;
  occurredAt: Date;

  static from(event: TripEvent): TripEventResponseDto {
    const dto = new TripEventResponseDto();
    dto.id = event.id;
    dto.tripId = event.tripId;
    dto.studentId = event.studentId;
    dto.type = event.type;
    dto.lat = event.lat ? event.lat.toString() : null;
    dto.lng = event.lng ? event.lng.toString() : null;
    dto.occurredAt = event.occurredAt;
    return dto;
  }
}
