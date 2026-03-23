interface RouteInfo {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  weekdays: string[];
  slots: number;
}

export class DriverListingResponseDto {
  userId: string;
  name: string;
  phone: string | null;
  status: string;
  averageRating: number | null;
  totalReviews: number;
  routes: RouteInfo[];

  static from(
    driver: {
      userId: string;
      status: string;
      user: { name: string; phone: string | null };
      routes: RouteInfo[];
    },
    averageRating: number | null,
    totalReviews: number,
  ): DriverListingResponseDto {
    const dto = new DriverListingResponseDto();
    dto.userId = driver.userId;
    dto.name = driver.user.name;
    dto.phone = driver.user.phone;
    dto.status = driver.status;
    dto.averageRating =
      averageRating !== null ? Math.round(averageRating * 10) / 10 : null;
    dto.totalReviews = totalReviews;
    dto.routes = driver.routes;
    return dto;
  }
}
