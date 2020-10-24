import { Service } from '../abstractions/service';
import { SessionModel } from '../models/session.model';
import { SessionsRepository } from '../repositories/sessions.repository';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export class SessionsService implements Service {
  constructor(private repository: SessionsRepository) {}

  async createSession(groupId: string, memberId: string): Promise<string> {
    const sessionId = uuidv4();
    const session: SessionModel = {
      id: sessionId,
      group: groupId,
      member: memberId,
      creation: new Date(),
      lastSeen: null
    };

    await this.repository.add(session);

    return jwt.sign({ session: sessionId }, process.env.SERVER_JWT_SECRET, { expiresIn: '1d' });
  }

  async getSession(id: string): Promise<SessionModel> {
    return await this.repository.get(id);
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result;
  }

  async validateSession(token: string): Promise<{ successful: boolean; sessionId: string }> {
    try {
      const validation = jwt.verify(token, process.env.SERVER_JWT_SECRET) as any;
      const session = await this.getSession(validation.session);

      return {
        successful: session != undefined,
        sessionId: session != undefined ? session.id : undefined
      };
    } catch (err) {
      console.log(err);
      return {
        successful: false,
        sessionId: null
      };
    }
  }
}
