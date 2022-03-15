import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Migrations {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  migration!: string;

  @Property()
  batch!: number;

}
