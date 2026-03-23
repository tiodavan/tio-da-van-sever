import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationProvider,
  SendMessageParams,
} from '../interfaces/notification-provider.interface';

/**
 * Stub implementation of the WhatsApp notification provider.
 * Replace this class (injected via WHATSAPP_PROVIDER token) with a real
 * Z-API or Twilio implementation without touching NotificationsService.
 */
@Injectable()
export class WhatsAppProvider implements INotificationProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);

  async send(params: SendMessageParams): Promise<void> {
    this.logger.log(
      `[STUB] WhatsApp → ${params.to}: "${params.message}"`,
    );
    // TODO: replace with real HTTP call to Z-API or Twilio
    // Example (Z-API):
    // await axios.post(
    //   `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    //   { phone: params.to, message: params.message },
    // );
  }
}
