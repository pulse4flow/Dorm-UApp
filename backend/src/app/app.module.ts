import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController, HealthController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { RepairsModule } from '../repairs/repairs.module';
import { ScoresModule } from '../scores/scores.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    UsersModule,
    RoomsModule,
    RepairsModule,
    ScoresModule,
    NotificationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
