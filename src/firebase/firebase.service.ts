import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const databaseURL = this.configService.get<string>('FIREBASE_DATABASE_URL');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not fully configured — Auth, FCM and RT DB features will be unavailable',
      );
    }

    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL,
      });
      this.logger.log('Firebase Admin SDK initialized');
    } else {
      this.app = admin.app();
      this.logger.log('Reusing existing Firebase Admin SDK instance');
    }
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  get messaging(): admin.messaging.Messaging {
    return this.app.messaging();
  }

  get database(): admin.database.Database {
    return this.app.database();
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }

  async deleteLocationNode(driverId: string): Promise<void> {
    this.logger.log(`Deleting Firebase RT DB node: vans/${driverId}`);
    await this.database.ref(`vans/${driverId}`).remove();
    this.logger.log(`Deleted RT DB node vans/${driverId}`);
  }

  async sendPushNotification(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    const { token, title, body, data } = params;
    await this.messaging.send({
      token,
      notification: { title, body },
      data,
    });
    this.logger.log(
      `Push notification sent — title: "${title}", token: ${token.substring(0, 16)}...`,
    );
  }
}
