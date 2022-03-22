import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ConcertAddedScorePerTimes {
  @PrimaryKey({ columnType: 'bigint' })
  id!: string;

  @Property({ defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Index({ name: 'concert_added_score_per_time_ticket_id_index' })
  @Property({ columnType: 'bigint' })
  ticketId!: string;

  @Index({ name: 'concert_added_score_per_time_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: string;

  @Property()
  addedScore!: number;
}
