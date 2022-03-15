import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class CoinHistories {
  @PrimaryKey({ columnType: 'bigint' })
  id!: string;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Index({ name: 'coin_histories_user_id_index' })
  @Property({ columnType: 'bigint' })
  userId!: string;

  @Index({ name: 'coin_histories_ticket_id_index' })
  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  ticketId?: string;

  @Index({ name: 'coin_histories_chat_id_index' })
  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  chatId?: string;

  @Property({ columnType: 'tinyint(4)', default: 0 })
  type: number = 0;

  @Property()
  variation!: number;
}
