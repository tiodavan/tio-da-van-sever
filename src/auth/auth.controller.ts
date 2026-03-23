import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Creates a new user profile in the database linked to the Firebase UID.
   * The Firebase token must be provided as Bearer; the UID is extracted from it.
   */
  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(user.uid, dto);
  }

  /**
   * Validates the Firebase token and returns the stored user profile.
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthResponseDto> {
    return this.authService.verify(user.uid);
  }
}
