import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Chats } from 'entities/Chats';
import { CoinHistories } from 'entities/CoinHistories';
import { ConcertAddedScorePerTime } from 'entities/ConcertAddedScorePerTime';
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
        ConcertAddedScorePerTime,
      ],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
