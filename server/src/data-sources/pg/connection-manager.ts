import { Pool } from 'pg';

export class PostgresConnectionManager {
  private static pool: Pool;

  static getPool(): Pool {
    if (this.pool == undefined) {
      this.pool = new Pool({
        host: process.env.SERVER_DB_HOST,
        port: Number.parseInt(process.env.SERVER_DB_PORT),
        user: process.env.SERVER_DB_USER,
        password: process.env.SERVER_DB_PASSWORD,
        database: process.env.SERVER_DB_NAME
      });
    }

    return this.pool;
  }
}
