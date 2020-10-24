import { createClient, RedisClient } from 'redis';

export class RedisConnectionManager {
  private static connection: RedisClient;

  static getRedisConnection(): RedisClient {
    if (this.connection == undefined)
      this.connection = createClient({
        host: process.env.SERVER_REDIS_HOST,
        port: Number.parseInt(process.env.SERVER_REDIS_PORT),
        password: process.env.SERVER_REDIS_PASSWORD
      });

    return this.connection;
  }
}
