// do not make changes to this file
const sharedConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  pool: { afterCreate: (conn, done) => conn.run('PRAGMA foreign_keys = ON', done) },
}

module.exports = {
  development: {
    ...sharedConfig,
    migrations: { directory: './data/migrations' },
    connection: { filename: './data/database.db3' },
    seeds: { directory: './data/seeds' },
  },
  testing: {
    ...sharedConfig,
    migrations: { directory: './data/testing/migrations' },
    connection: { filename: './data/testing/database.db3' },
    seeds: { directory: './data/testing/seeds'}
  },
  production: {
    ...sharedConfig,
    migrations: { directory: './data/migrations' },
    connection: { filename: './data/highescores.db3' },
  },
};
