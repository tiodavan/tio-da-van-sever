import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { WHATSAPP_PROVIDER } from './interfaces/notification-provider.interface';

@Module({
  providers: [
    NotificationsService,
    {
      provide: WHATSAPP_PROVIDER,
      useClass: WhatsAppProvider,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
