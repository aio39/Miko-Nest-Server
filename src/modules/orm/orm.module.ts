import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Chats } from 'entities/Chats';
import { CoinHistories } from 'entities/CoinHistories';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { Concerts } from 'entities/Concerts';
import { Users } from 'entities/Users';
import { UserTicket } from 'entities/UserTicket';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // autoLoadEntities: true, // forFeature로 등록한 엔티티 자동 등록
    }),
    MikroOrmModule.forFeature({
      entities: [
        Concerts,
        CoinHistories,
        Users,
        UserTicket,
        Chats,
        ConcertAddedScorePerTimes,
      ],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
