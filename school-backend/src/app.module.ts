import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { ExamsModule } from './exams/exams.module';
import { GradesModule } from './grades/grades.module';
import { ParentsModule } from './parents/parents.module';
import { ClassesModule } from './classes/classes.module';
import { LessonsModule } from './lessons/lessons.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ResultsModule } from './results/results.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventsModule } from './events/events.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MessagesModule } from './messages/messages.module';
import { AuditModule } from './audit/audit.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        // Global default: generous enough not to bother normal usage,
        // tight enough to stop a runaway script. Sensitive mutations
        // (login/register/refreshToken) override this with @Throttle()
        // in auth.resolver.ts for much tighter limits.
        { ttl: 60_000, limit: 60 },
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      // Both req and res are needed now — GqlThrottlerGuard reads req
      // for the client IP and writes rate-limit headers onto res.
      context: ({ req, res }) => ({ req, res }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    AuditModule,
    EmailModule,
    SubjectsModule,
    TeachersModule,
    StudentsModule,
    ExamsModule,
    GradesModule,
    ParentsModule,
    ClassesModule,
    LessonsModule,
    AssignmentsModule,
    ResultsModule,
    AttendanceModule,
    EventsModule,
    AnnouncementsModule,
    MessagesModule,
  ],
   providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
