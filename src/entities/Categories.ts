import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

@Entity()
export class Categories {
  @PrimaryKey({ columnType: 'bigint' })
  id!: string;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Unique({ name: 'categories_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @ManyToOne({
    entity: () => Categories,
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: true,
    defaultRaw: `NULL`,
    index: 'categories_parent_id_foreign',
    columnType: 'bigint',
  })
  parent?: Categories;
}
