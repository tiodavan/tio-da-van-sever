import { Guardianship } from '@prisma/client';

export class GuardianshipResponseDto {
  guardianUserId: string;
  studentUserId: string;
  approved: boolean;
  active: boolean;
  createdAt: Date;

  static from(g: Guardianship): GuardianshipResponseDto {
    const dto = new GuardianshipResponseDto();
    dto.guardianUserId = g.guardianUserId;
    dto.studentUserId = g.studentUserId;
    dto.approved = g.approved;
    dto.active = g.active;
    dto.createdAt = g.createdAt;
    return dto;
  }
}
