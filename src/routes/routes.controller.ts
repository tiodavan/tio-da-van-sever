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
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<RouteResponseDto[]> {
    return this.routesService.findAllForDriver(user.uid);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    return this.routesService.create(user.uid, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    return this.routesService.update(user.uid, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.routesService.remove(user.uid, id);
  }
}
