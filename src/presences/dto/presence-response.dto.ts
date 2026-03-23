import { Presence } from '@prisma/client';

export class PresenceResponseDto {
  id: string;
  tripId: string;
  studentId: string;
  confirmed: boolean | null;
  confirmedAt: Date | null;
  deadlineAt: Date;

  static from(presence: Presence): PresenceResponseDto {
    const dto = new PresenceResponseDto();
    dto.id = presence.id;
    dto.tripId = presence.tripId;
    dto.studentId = presence.studentId;
    dto.confirmed = presence.confirmed;
    dto.confirmedAt = presence.confirmedAt;
    dto.deadlineAt = presence.deadlineAt;
    return dto;
  }
}
