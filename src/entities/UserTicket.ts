import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Users } from './Users';

@Entity()
export class UserTicket {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @ManyToOne({
    entity: () => Users,
    onDelete: 'cascade',
    index: 'user_ticket_user_id_foreign',
    columnType: 'bigint',
  })
  user!: Users;

  @Index({ name: 'user_ticket_ticket_id_index' })
  @Property({ columnType: 'bigint' })
  ticketId!: number;

  @Index({ name: 'user_ticket_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: number;

  @Property({ default: false })
  isUsed: boolean = false;

  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  pRanking?: string;

  @Property({ columnType: 'bigint', nullable: true, defaultRaw: `NULL` })
  gRanking?: string;
}
