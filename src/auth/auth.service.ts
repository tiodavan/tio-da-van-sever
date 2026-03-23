import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(uid: string, dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registering user uid=${uid} role=${dto.role}`);

    const existing = await this.prisma.user.findUnique({ where: { id: uid } });
    if (existing) {
      throw new ConflictException(`User with uid ${uid} is already registered`);
    }

    this.validateRoleFields(dto);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id: uid,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          dateOfBirth: new Date(dto.dateOfBirth),
          fcmToken: dto.fcmToken,
          roles: { create: { role: dto.role } },
        },
        include: { roles: true },
      });

      if (dto.role === Role.driver) {
        const company = await tx.company.create({
          data: {
            userId: uid,
            taxId: dto.taxId!,
            legalName: dto.legalName!,
            type: dto.companyType!,
          },
        });

        await tx.driver.create({
          data: { userId: uid, companyId: company.id },
        });

        this.logger.log(
          `Driver profile + company created for uid=${uid} companyId=${company.id}`,
        );
      }

      if (dto.role === Role.student) {
        await tx.student.create({
          data: {
            userId: uid,
            school: dto.school!,
            pickupAddress: dto.pickupAddress!,
          },
        });

        this.logger.log(`Student profile created for uid=${uid}`);
      }

      return created;
    });

    this.logger.log(`User uid=${uid} registered successfully`);
    return AuthResponseDto.from(UserResponseDto.from(user));
  }

  async verify(uid: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(
        `No profile found for uid=${uid}. Please register first.`,
      );
    }

    return AuthResponseDto.from(UserResponseDto.from(user));
  }

  private validateRoleFields(dto: RegisterDto): void {
    if (dto.role === Role.driver) {
      if (!dto.taxId || !dto.legalName || !dto.companyType) {
        throw new BadRequestException(
          'Driver registration requires: taxId, legalName, companyType',
        );
      }
    }

    if (dto.role === Role.student) {
      if (!dto.school || !dto.pickupAddress) {
        throw new BadRequestException(
          'Student registration requires: school, pickupAddress',
        );
      }
    }
  }
}
