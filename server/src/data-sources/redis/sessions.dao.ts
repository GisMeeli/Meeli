import { SessionModel } from '../../models/session.model';
import { SessionsRepository } from '../../repositories/sessions.repository';
import { RedisConnectionManager } from './connection-manager';

export class SessionsDao implements SessionsRepository {
  async add(session: SessionModel): Promise<void> {
    const tedis = await RedisConnectionManager.getRedisConnection().getTedis();

    const id = session.id;
    session.id = undefined;
    tedis.set(id, JSON.stringify(session));

    console.log(`Session added: ${id}`);

    RedisConnectionManager.getRedisConnection().putTedis(tedis);
    tedis.close();
  }

  async delete(id: string): Promise<boolean> {
    try {
      const tedis = await RedisConnectionManager.getRedisConnection().getTedis();
      await tedis.del(id);
      tedis.close();

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async get(id: string): Promise<SessionModel> {
    const tedis = await RedisConnectionManager.getRedisConnection().getTedis();
    const data: string = (await tedis.get(id)) as string;

    tedis.close();

    if (data == null || data == undefined) {
      return undefined;
    }

    const session = JSON.parse(data) as SessionModel;
    session.id = id;

    return session;
  }
}
