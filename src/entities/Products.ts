import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Products {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Index({ name: 'products_concert_id_index' })
  @Property({ columnType: 'bigint' })
  concertId!: number;

  @Property()
  price!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  detail!: string;

  @Property({ length: 255 })
  image!: string;
}
