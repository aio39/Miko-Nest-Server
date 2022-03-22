import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Tickets {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Index({ name: 'tickets_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: number;

  @Property()
  price!: number;

  @Property({ columnType: 'smallint' })
  runningTime!: number;

  @Property({ default: '0000-00-00 00:00:00' })
  saleStartDate!: Date;

  @Property({ default: '0000-00-00 00:00:00' })
  saleEndDate!: Date;

  @Property({ default: '0000-00-00 00:00:00' })
  concertStartDate!: Date;

  @Property({ default: '0000-00-00 00:00:00' })
  concertEndDate!: Date;

  @Property({ default: '0000-00-00 00:00:00' })
  archiveEndTime!: Date;

  @Property({ length: 255 })
  channelArn!: string;

  @Property({ length: 255 })
  playbackUrl!: string;

  @Property({ length: 255 })
  streamKeyArn!: string;

  @Property({ length: 255 })
  streamKeyValue!: string;

  @Property({ length: 255 })
  ingestEndpoint!: string;
}
