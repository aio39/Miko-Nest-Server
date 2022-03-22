import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class Users {
  @PrimaryKey({ columnType: 'bigint' })
  id!: number;

  @Property({ columnType: 'char(36)', length: 36 })
  uuid!: unknown;

  @Property({ nullable: true, defaultRaw: `NULL` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `NULL` })
  updatedAt?: Date;

  @Property({ length: 255 })
  name!: string;

  @Unique({ name: 'users_email_unique' })
  @Property({ length: 255 })
  email!: string;

  @Property({ nullable: true, defaultRaw: `NULL` })
  emailVerifiedAt?: Date;

  @Property({ length: 255 })
  password!: string;

  @Property({ length: 255, nullable: true, default: 'NULL' })
  avatar?: string;

  @Property({ length: 100, nullable: true, default: 'NULL' })
  rememberToken?: string;

  @Property({ columnType: 'bigint', defaultRaw: `0` })
  coin!: number;

  @Property({ columnType: 'tinyint(4)', default: 1 })
  type: number = 1;

  @Property({ length: 255, nullable: true, default: 'NULL' })
  googleId?: string;

  @Property({ length: 255, nullable: true, default: 'NULL' })
  twitterId?: string;
}
