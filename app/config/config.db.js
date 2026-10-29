import knex from 'knex';
import knexConfig from '../../knexfile.js';
import 'dotenv/config';

const environment = process.env.APP_ENV || 'production';
const config = knexConfig[environment];

/** @type {import('knex').Knex} */
const db = knex(config);

export default db;