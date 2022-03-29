import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class CoTiCurEnterUserNums {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Index({ name: 'co_ti_cur_enter_user_nums_ticket_id_index' })
  @Property({ columnType: 'bigint' })
  ticketId!: number;

  @Index({ name: 'co_ti_cur_enter_user_nums_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: number;

  @Property()
  nums!: number;
}
