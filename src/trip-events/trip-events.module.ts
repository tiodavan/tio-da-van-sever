import { Module } from '@nestjs/common';
import { TripEventsController } from './trip-events.controller';
import { TripEventsService } from './trip-events.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TripEventsController],
  providers: [TripEventsService],
})
export class TripEventsModule {}
