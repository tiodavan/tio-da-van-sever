import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  type INotificationProvider,
  WHATSAPP_PROVIDER,
} from './interfaces/notification-provider.interface';
import { TripEventType } from '@prisma/client';

interface GuardianContact {
  userId: string;
  fcmToken?: string | null;
  phone?: string | null;
  name: string;
}

interface StudentInfo {
  userId: string;
  name: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsAppProvider: INotificationProvider,
  ) {}

  async notifyGuardiansOfTripEvent(
    eventType: TripEventType,
    student: StudentInfo,
    guardians: GuardianContact[],
  ): Promise<void> {
    if (!guardians.length) {
      this.logger.debug(
        `No guardians to notify for student ${student.userId} — event ${eventType}`,
      );
      return;
    }

    const { title, body } = this.buildNotificationContent(
      eventType,
      student.name,
    );

    for (const guardian of guardians) {
      await this.sendPush(guardian, title, body);
      await this.sendWhatsApp(guardian, title, body);
    }
  }

  private async sendPush(
    guardian: GuardianContact,
    title: string,
    body: string,
  ): Promise<void> {
    if (!guardian.fcmToken) return;

    try {
      await this.firebaseService.sendPushNotification({
        token: guardian.fcmToken,
        title,
        body,
      });
    } catch (error) {
      this.logger.error(
        `FCM push failed for guardian ${guardian.userId}: ${(error as Error).message}`,
      );
    }
  }

  private async sendWhatsApp(
    guardian: GuardianContact,
    title: string,
    body: string,
  ): Promise<void> {
    if (!guardian.phone) return;

    try {
      await this.whatsAppProvider.send({
        to: guardian.phone,
        message: `*${title}*\n${body}`,
      });
    } catch (error) {
      this.logger.error(
        `WhatsApp send failed for guardian ${guardian.userId}: ${(error as Error).message}`,
      );
    }
  }

  private buildNotificationContent(
    eventType: TripEventType,
    studentName: string,
  ): { title: string; body: string } {
    const map: Record<TripEventType, { title: string; body: string }> = {
      trip_started: {
        title: 'Van a caminho',
        body: `A van está saindo para buscar ${studentName}.`,
      },
      pickup: {
        title: 'Embarque confirmado',
        body: `${studentName} embarcou na van.`,
      },
      missed_pickup: {
        title: 'Embarque não realizado',
        body: `${studentName} não foi encontrado(a) no ponto de embarque.`,
      },
      arrived_school: {
        title: 'Chegou à escola',
        body: `${studentName} chegou à escola.`,
      },
      dropoff: {
        title: 'Desembarque confirmado',
        body: `${studentName} desembarcou da van.`,
      },
      trip_ended: {
        title: 'Viagem encerrada',
        body: 'A viagem foi encerrada pelo motorista.',
      },
    };

    return map[eventType] ?? { title: 'Atualização da van', body: studentName };
  }
}
