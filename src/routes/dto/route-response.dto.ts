import { Route } from '@prisma/client';

export class RouteResponseDto {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  weekdays: string[];
  slots: number;
  active: boolean;

  static from(route: Route): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.id = route.id;
    dto.driverId = route.driverId;
    dto.origin = route.origin;
    dto.destination = route.destination;
    dto.departureTime = route.departureTime;
    dto.weekdays = route.weekdays;
    dto.slots = route.slots;
    dto.active = route.active;
    return dto;
  }
}
