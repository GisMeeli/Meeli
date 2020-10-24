import { Tedis, TedisPool } from 'tedis';

export class RedisConnectionManager {
  private static connection: TedisPool;

  static getRedisConnection(): TedisPool {
    if (this.connection == undefined)
      this.connection = new TedisPool({
        host: process.env.SERVER_REDIS_HOST,
        port: Number.parseInt(process.env.SERVER_REDIS_PORT)
      });


    return this.connection;
  }
}
