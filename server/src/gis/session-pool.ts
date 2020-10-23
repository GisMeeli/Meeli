import { createClient, RedisClient } from 'redis';
import { client } from 'websocket';
export class SessionPool {
  private __redis: RedisClient;

  private static getClient() {
    
  }

  createSession() {}

  getSession(id: string): any {

  }
}
