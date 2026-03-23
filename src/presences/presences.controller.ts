import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PresencesService } from './presences.service';
import { UpdatePresenceDto } from './dto/update-presence.dto';
import { PresenceResponseDto } from './dto/presence-response.dto';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@Controller()
export class PresencesController {
  constructor(private readonly presencesService: PresencesService) {}

  @Get('trips/:tripId/presences')
  findByTrip(
    @Param('tripId') tripId: string,
  ): Promise<PresenceResponseDto[]> {
    return this.presencesService.findByTrip(tripId);
  }

  @Patch('presences/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePresenceDto,
  ): Promise<PresenceResponseDto> {
    return this.presencesService.update(user.uid, id, dto);
  }
}
