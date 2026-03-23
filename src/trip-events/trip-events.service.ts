import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TripEventType, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTripEventDto } from './dto/create-trip-event.dto';
import { TripEventResponseDto } from './dto/trip-event-response.dto';

const NOTIFICATION_EVENT_TYPES: TripEventType[] = [
  TripEventType.pickup,
  TripEventType.arrived_school,
];

@Injectable()
export class TripEventsService {
  private readonly logger = new Logger(TripEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    driverUserId: string,
    tripId: string,
    dto: CreateTripEventDto,
  ): Promise<TripEventResponseDto> {
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

    if (trip.status !== TripStatus.active) {
      throw new BadRequestException(
        `Cannot add events to a trip with status "${trip.status}". Trip must be active.`,
      );
    }

    // Student-specific events require a studentId
    const studentRequiredTypes: TripEventType[] = [
      TripEventType.pickup,
      TripEventType.missed_pickup,
      TripEventType.dropoff,
    ];

    if (studentRequiredTypes.includes(dto.type) && !dto.studentId) {
      throw new BadRequestException(
        `Event type "${dto.type}" requires a studentId`,
      );
    }

    this.logger.log(
      `Persisting trip event type=${dto.type} for trip=${tripId}` +
        (dto.studentId ? ` student=${dto.studentId}` : ''),
    );

    const event = await this.prisma.tripEvent.create({
      data: {
        tripId,
        type: dto.type,
        studentId: dto.studentId ?? null,
        lat: dto.lat ? dto.lat : null,
        lng: dto.lng ? dto.lng : null,
      },
    });

    // Notify guardians asynchronously for relevant event types
    if (NOTIFICATION_EVENT_TYPES.includes(dto.type) && dto.studentId) {
      this.notifyGuardians(dto.type, dto.studentId).catch((error) => {
        this.logger.error(
          `Guardian notification failed for event ${event.id}: ${(error as Error).message}`,
        );
      });
    }

    return TripEventResponseDto.from(event);
  }

  async findByTrip(tripId: string): Promise<TripEventResponseDto[]> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    const events = await this.prisma.tripEvent.findMany({
      where: { tripId },
      orderBy: { occurredAt: 'asc' },
    });

    return events.map((e) => TripEventResponseDto.from(e));
  }

  private async notifyGuardians(
    eventType: TripEventType,
    studentId: string,
  ): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentId },
      include: { user: true },
    });

    if (!student) {
      this.logger.warn(
        `Student ${studentId} not found — skipping guardian notification`,
      );
      return;
    }

    const guardianships = await this.prisma.guardianship.findMany({
      where: { studentUserId: studentId, active: true, approved: true },
      include: { guardian: true },
    });

    if (!guardianships.length) {
      this.logger.debug(
        `No active guardians for student ${studentId} — skipping notification`,
      );
      return;
    }

    const guardians = guardianships.map((g) => ({
      userId: g.guardian.id,
      name: g.guardian.name,
      fcmToken: g.guardian.fcmToken,
      phone: g.guardian.phone,
    }));

    await this.notificationsService.notifyGuardiansOfTripEvent(
      eventType,
      { userId: student.userId, name: student.user.name },
      guardians,
    );
  }
}
