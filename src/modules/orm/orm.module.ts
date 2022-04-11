import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Chats } from 'entities/Chats';
import { CoinHistories } from 'entities/CoinHistories';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { Concerts } from 'entities/Concerts';
import { CoTiAddedChatPerTimes } from 'entities/CoTiAddedChatPerTimes';
import { CoTiAmountDonePerTimes } from 'entities/CoTiAmountDonePerTimes';
import { CoTiAmountSuperChatPerTimes } from 'entities/CoTiAmountSuperChatPerTimes';
import { CoTiCurEnterUserNums } from 'entities/CoTiCurEnterUserNums';
import { Recordings } from 'entities/Recordings';
import { Tickets } from 'entities/Tickets';
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
        CoTiAddedChatPerTimes,
        CoTiAmountDonePerTimes,
        CoTiAmountSuperChatPerTimes,
        CoTiCurEnterUserNums,
        Tickets,
        Recordings,
      ],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
