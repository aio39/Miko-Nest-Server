import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Tickets } from './Tickets';

@Entity()
export class Recordings {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @ManyToOne({
    entity: () => Tickets,
    index: 'recordings_ticket_id_foreign',
    columnType: 'bigint',
  })
  ticket!: Tickets;

  @Property({ length: 255 })
  prefix!: string;

  @Property({ length: 255 })
  streamId!: string;

  @Property({ default: '0000-00-00 00:00:00' })
  end!: string;

  @Property({ default: '0000-00-00 00:00:00' })
  start!: string;

  @Property({ default: true })
  avlArchive: boolean = true;
}
