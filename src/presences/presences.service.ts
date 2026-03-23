import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceResponseDto } from './dto/presence-response.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';

@Injectable()
export class PresencesService {
  private readonly logger = new Logger(PresencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByTrip(tripId: string): Promise<PresenceResponseDto[]> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    const presences = await this.prisma.presence.findMany({
      where: { tripId },
      orderBy: { deadlineAt: 'asc' },
    });

    return presences.map((p) => PresenceResponseDto.from(p));
  }

  /**
   * Allows a guardian to confirm or deny their student's presence on a trip.
   * Verifies the caller is an active, approved guardian of the student linked to this presence.
   */
  async update(
    guardianUserId: string,
    presenceId: string,
    dto: UpdatePresenceDto,
  ): Promise<PresenceResponseDto> {
    const presence = await this.prisma.presence.findUnique({
      where: { id: presenceId },
    });

    if (!presence) {
      throw new NotFoundException(`Presence ${presenceId} not found`);
    }

    const guardianship = await this.prisma.guardianship.findFirst({
      where: {
        guardianUserId,
        studentUserId: presence.studentId,
        active: true,
        approved: true,
      },
    });

    if (!guardianship) {
      throw new ForbiddenException(
        'You are not an approved guardian of this student',
      );
    }

    this.logger.log(
      `Guardian ${guardianUserId} setting presence ${presenceId} → confirmed=${dto.confirmed}`,
    );

    const updated = await this.prisma.presence.update({
      where: { id: presenceId },
      data: {
        confirmed: dto.confirmed,
        confirmedAt: new Date(),
      },
    });

    return PresenceResponseDto.from(updated);
  }
}
