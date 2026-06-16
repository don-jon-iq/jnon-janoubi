'use strict';

const config = require('./config');
const seedIfEmpty = require('./db/seed'); // requiring this opens the DB + applies the schema
const buildApp = require('./app');

const seeded = seedIfEmpty();

const app = buildApp();

app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`جنون جنوبي server listening on :${config.PORT} (${config.NODE_ENV})${seeded ? ' — seeded initial catalog' : ''}`);
});
