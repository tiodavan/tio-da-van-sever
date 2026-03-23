interface RouteLeg {
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
}

export class OptimizedRouteResponseDto {
  summary: string;
  waypointOrder: number[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  legs: RouteLeg[];
  overviewPolyline: string;

  static fromGoogleMapsResponse(
    data: Record<string, any>,
  ): OptimizedRouteResponseDto {
    const route = data.routes[0];
    const legs: any[] = route.legs;

    const dto = new OptimizedRouteResponseDto();
    dto.summary = route.summary;
    dto.waypointOrder = route.waypoint_order ?? [];
    dto.totalDistanceMeters = legs.reduce(
      (sum: number, leg: any) => sum + leg.distance.value,
      0,
    );
    dto.totalDurationSeconds = legs.reduce(
      (sum: number, leg: any) => sum + leg.duration.value,
      0,
    );
    dto.legs = legs.map((leg: any) => ({
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      distance: leg.distance.text,
      duration: leg.duration.text,
    }));
    dto.overviewPolyline = route.overview_polyline?.points ?? '';
    return dto;
  }
}
