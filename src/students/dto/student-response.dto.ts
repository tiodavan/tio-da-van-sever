import { Student, User, UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

type StudentWithUser = Student & { user: User & { roles: UserRole[] } };

export class StudentResponseDto {
  userId: string;
  school: string;
  pickupAddress: string;
  requiresGuardian: boolean;
  user: UserResponseDto;

  static from(student: StudentWithUser): StudentResponseDto {
    const dto = new StudentResponseDto();
    dto.userId = student.userId;
    dto.school = student.school;
    dto.pickupAddress = student.pickupAddress;
    dto.requiresGuardian = StudentResponseDto.computeRequiresGuardian(
      student.user.dateOfBirth,
    );
    dto.user = UserResponseDto.from(student.user);
    return dto;
  }

  private static computeRequiresGuardian(dateOfBirth: Date): boolean {
    const now = new Date();
    const eighteenYearsAgo = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate(),
    );
    return dateOfBirth > eighteenYearsAgo;
  }
}
