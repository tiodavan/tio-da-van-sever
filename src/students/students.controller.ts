import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudentsService } from './students.service';
import { GuardianLinkRequestDto } from './dto/guardian-link-request.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { GuardianshipResponseDto } from '../guardianships/dto/guardianship-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<StudentResponseDto> {
    return this.studentsService.findMe(user.uid);
  }

  @Post('me/guardian-link')
  requestGuardianLink(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GuardianLinkRequestDto,
  ): Promise<GuardianshipResponseDto> {
    return this.studentsService.requestGuardianLink(
      user.uid,
      dto.guardianUserId,
    );
  }
}
