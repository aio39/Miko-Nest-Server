import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
@Index({
  name: 'personal_access_tokens_tokenable_type_tokenable_id_index',
  properties: ['tokenableType', 'tokenableId'],
})
export class PersonalAccessTokens {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ length: 255 })
  tokenableType!: string;

  @Property({ columnType: 'bigint' })
  tokenableId!: string;

  @Property({ length: 255 })
  name!: string;

  @Unique({ name: 'personal_access_tokens_token_unique' })
  @Property({ length: 64 })
  token!: string;

  @Property({
    columnType: 'text',
    length: 65535,
    nullable: true,
    default: 'NULL',
  })
  abilities?: string;

  @Property({ nullable: true, defaultRaw: `NULL` })
  lastUsedAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;
}
