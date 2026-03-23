import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { StudentsModule } from './students/students.module';
import { GuardianshipsModule } from './guardianships/guardianships.module';
import { RoutesModule } from './routes/routes.module';
import { TripsModule } from './trips/trips.module';
import { PresencesModule } from './presences/presences.module';
import { TripEventsModule } from './trip-events/trip-events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    StudentsModule,
    GuardianshipsModule,
    RoutesModule,
    TripsModule,
    PresencesModule,
    TripEventsModule,
    NotificationsModule,
    MarketplaceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
