import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { RoomsModule } from '../rooms/rooms.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { RepairsModule } from '../repairs/repairs.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ScoresModule } from '../scores/scores.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    RoomsModule,
    AnnouncementsModule,
    RepairsModule,
    ActivitiesModule,
    ScoresModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
