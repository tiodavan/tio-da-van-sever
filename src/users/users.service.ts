import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return UserResponseDto.from(user);
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    this.logger.log(`Updating FCM token for user ${userId}`);
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }
}
