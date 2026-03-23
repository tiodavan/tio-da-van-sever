import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverDocumentsDto } from './dto/update-driver-documents.dto';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<DriverResponseDto> {
    return this.driversService.findMe(user.uid);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.updateMe(user.uid, dto);
  }

  @Post('me/documents')
  updateDocuments(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDriverDocumentsDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.updateDocuments(user.uid, dto);
  }

  @Patch('me/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDriverStatusDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.updateStatus(user.uid, dto);
  }
}
