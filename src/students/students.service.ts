import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuardianshipsService } from '../guardianships/guardianships.service';
import { StudentResponseDto } from './dto/student-response.dto';
import { GuardianshipResponseDto } from '../guardianships/dto/guardianship-response.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly guardianshipsService: GuardianshipsService,
  ) {}

  async findMe(studentUserId: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
      include: { user: { include: { roles: true } } },
    });

    if (!student) {
      throw new NotFoundException(
        `Student profile not found for userId=${studentUserId}`,
      );
    }

    return StudentResponseDto.from(student);
  }

  async requestGuardianLink(
    studentUserId: string,
    guardianUserId: string,
  ): Promise<GuardianshipResponseDto> {
    // Ensure this user actually has a student profile
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException(
        `Student profile not found for userId=${studentUserId}`,
      );
    }

    this.logger.log(
      `Student ${studentUserId} requesting guardian link with ${guardianUserId}`,
    );

    return this.guardianshipsService.requestLink(studentUserId, guardianUserId);
  }
}
