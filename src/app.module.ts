import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from 'middleware/morgan.middleware';
import { TicketModule } from 'modules/ticket/ticket.module';
import { redisProviders } from 'redis.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConcertsModule } from './modules/concerts/concerts.module';
import { IvsController } from './modules/ivs/ivs.controller';
import { IvsModule } from './modules/ivs/ivs.module';
import { IvsService } from './modules/ivs/ivs.service';
import { OrmModule } from './modules/orm/orm.module';
import { RankModule } from './rank/rank.module';
import { RoomModule } from './room/room.module';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [
    OrmModule,
    EventsModule,
    IvsModule,
    // CacheModule.register<RedisClientOptions>({
    //   store: redisStore,
    //   isGlobal: false,
    //   socket: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.prod.env' : '.dev.env',
    }),
    RoomModule,
    ConcertsModule,
    ScheduleModule.forRoot(),
    TasksModule,
    RankModule,
    TicketModule,
  ],
  controllers: [AppController, IvsController],
  providers: [AppService, IvsService, ...redisProviders],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*'); //middleware들은 consumer에다가 연결한다!
  }
}
