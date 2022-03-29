import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class CoTiAddedChatPerTimes {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Index({ name: 'co_ti_added_chat_per_times_ticket_id_index' })
  @Property({ columnType: 'bigint' })
  ticketId!: number;

  @Index({ name: 'co_ti_added_chat_per_times_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: number;

  @Property()
  added!: number;
}
