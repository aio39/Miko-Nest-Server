import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Concerts } from './../../entities/Concerts';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // autoLoadEntities:true // forFeature로 등록한 엔티티 자동 등록
    }),
    MikroOrmModule.forFeature({
      entities: [Concerts],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
