'use strict';

const config = require('./config');
const initDb = require('./db/initDb');
const seedIfEmpty = require('./db/seed');
const buildApp = require('./app');

initDb();
const seeded = seedIfEmpty();

const app = buildApp();

app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`جنون جنوبي server listening on :${config.PORT} (${config.NODE_ENV})${seeded ? ' — seeded initial catalog' : ''}`);
});
