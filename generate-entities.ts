import { MikroORM } from '@mikro-orm/core';

(async () => {
  const orm = await MikroORM.init({
    discovery: {
      // we need to disable validation for no entities
      warnWhenNoEntities: false,
    },
    dbName: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    type: 'mysql',
    // ...
  });
  const generator = orm.getEntityGenerator();
  const dump = await generator.generate({
    save: true,
    baseDir: process.cwd() + '/temp',
  });
  console.log(dump);
  await orm.close(true);
})();
// ts-node generate-entities
