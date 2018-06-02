const { Pool } = require('pg');

const errorEnum = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514'
};

class db {
  constructor(credentials) {
    this.pool = new Pool(credentials);
  }

  async acquire() {
    return await this.pool.connect();
  }

  async ensureGuild(client, guildID) {
    await client.query(`
      INSERT INTO guilds (id)
      VALUES ($1::BIGINT)
      ON CONFLICT (id) DO NOTHING
      `, [guildID]);
  }
}

module.exports = db;