import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuardianshipResponseDto } from './dto/guardianship-response.dto';

@Injectable()
export class GuardianshipsService {
  private readonly logger = new Logger(GuardianshipsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Student requests to be linked to a guardian.
   * The guardianship starts unapproved; the guardian must approve separately.
   */
  async requestLink(
    studentUserId: string,
    guardianUserId: string,
  ): Promise<GuardianshipResponseDto> {
    if (studentUserId === guardianUserId) {
      throw new BadRequestException(
        'A user cannot be their own guardian',
      );
    }

    const guardian = await this.prisma.user.findUnique({
      where: { id: guardianUserId },
      include: { roles: true },
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian user ${guardianUserId} not found`);
    }

    const hasGuardianRole = guardian.roles.some((r) => r.role === 'guardian');
    if (!hasGuardianRole) {
      throw new BadRequestException(
        `User ${guardianUserId} does not have the guardian role`,
      );
    }

    const existing = await this.prisma.guardianship.findUnique({
      where: {
        guardianUserId_studentUserId: { guardianUserId, studentUserId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'A guardianship link already exists between these users',
      );
    }

    this.logger.log(
      `Creating guardianship: student=${studentUserId} → guardian=${guardianUserId}`,
    );

    const guardianship = await this.prisma.guardianship.create({
      data: { guardianUserId, studentUserId },
    });

    return GuardianshipResponseDto.from(guardianship);
  }

  async findGuardiansForStudent(studentUserId: string) {
    return this.prisma.guardianship.findMany({
      where: { studentUserId, active: true, approved: true },
      include: { guardian: true },
    });
  }
}
