import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehicleResponseDto[]> {
    return this.vehiclesService.findAllForDriver(user.uid);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.create(user.uid, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleDto>,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.update(user.uid, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.vehiclesService.remove(user.uid, id);
  }
}
