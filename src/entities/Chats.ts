import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Chats {

  @PrimaryKey({ columnType: 'bigint' })
  id!: string;

  @Property({ defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Index({ name: 'chats_user_id_index' })
  @Property({ columnType: 'bigint' })
  userId!: string;

  @Index({ name: 'chats_ticket_id_index' })
  @Property({ columnType: 'bigint' })
  ticketId!: string;

  @Property({ length: 255, nullable: true, default: 'NULL' })
  text?: string;

}
