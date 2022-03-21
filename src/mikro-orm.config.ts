import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
// import { Author, BaseEntity, Book, BookTag, Publisher } from './entities';

const logger = new Logger('MikroORM');
const config: Options = {
  // entities: [Author, Book, BookTag, Publisher, BaseEntity],
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  host: process.env.DB_HOST,
  type: 'mysql',
  user: process.env.DB_USER,
  dbName: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 3306,
  highlighter: new SqlHighlighter(),
  debug: true,
  logger: logger.log.bind(logger),
  migrations: {
    dropTables: true,
  },
  allowGlobalContext: true,
};

export default config;
