import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Categories } from './Categories';
import { Users } from './Users';

@Entity()
@Index({ name: 'concerts_fulltext_index', properties: ['title', 'artist'] })
export class Concerts {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @ManyToOne({
    entity: () => Categories,
    columnType: 'bigint',
    index: 'concerts_category_id_foreign',
  })
  category!: Categories;

  @ManyToOne({
    entity: () => Users,
    columnType: 'bigint',
    index: 'concerts_user_id_foreign',
  })
  user!: Users;

  @Property({ length: 255 })
  coverImage!: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ length: 255 })
  artist!: string;

  @Property({ length: 255 })
  detail!: string;

  @Property({
    columnType: 'longtext',
    length: 4294967295,
    nullable: true,
    default: 'NULL',
  })
  content?: unknown;

  @Property({ default: false })
  isPublic: boolean = false;

  @Property({ default: '0000-00-00 00:00:00' })
  allConcertStartDate!: Date;

  @Property({ default: '0000-00-00 00:00:00' })
  allConcertEndDate!: Date;
}
