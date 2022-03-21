import { MikroORM } from '@mikro-orm/core';
require('dotenv').config({ path: '.dev.env' });

(async () => {
  const orm = await MikroORM.init({
    discovery: {
      // we need to disable validation for no entities
      warnWhenNoEntities: false,
    },
    type: 'mysql',
    host: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 3306,
    // ...
  });

  const generator = orm.getEntityGenerator();
  const dump = await generator.generate({
    save: true,
    baseDir: process.cwd() + '/temp/entity',
  });
  console.log(dump);
  await orm.close(true);
})();
// ts-node generate-entities
