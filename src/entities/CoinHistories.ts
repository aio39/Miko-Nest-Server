import { Entity, Index, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Chats } from './Chats';

@Entity()
export class CoinHistories {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Index({ name: 'coin_histories_user_id_index' })
  @Property({ columnType: 'bigint' })
  userId!: number;

  @Index({ name: 'coin_histories_ticket_id_index' })
  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  ticketId?: number;

  @Index({ name: 'coin_histories_chat_id_index' })
  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  chatId?: number;

  @OneToOne({ entity: () => Chats, columnType: 'bigint' })
  chat!: Chats;

  @Property({ columnType: 'tinyint(4)', default: 0 })
  type: number = 0;

  @Property()
  variation!: number;
}
