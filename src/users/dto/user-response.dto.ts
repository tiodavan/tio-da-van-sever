import { Role, User, UserRole } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date;
  roles: Role[];
  createdAt: Date;

  static from(user: User & { roles: UserRole[] }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.dateOfBirth = user.dateOfBirth;
    dto.roles = user.roles.map((r) => r.role);
    dto.createdAt = user.createdAt;
    return dto;
  }
}
