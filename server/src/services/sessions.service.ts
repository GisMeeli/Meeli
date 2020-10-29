import { Service } from '../abstractions/service';
import { SessionModel } from '../models/session.model';
import { SessionsRepository } from '../repositories/sessions.repository';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { GroupCategoryModel } from '../models/group-category.model';
import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { getTimeDifferenceInMillis } from '../utils/time-utils';

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

  async authenticateSession(token: string): Promise<AuthenticatedSessionModel> {
    try {
      const validation = jwt.verify(token, process.env.SERVER_JWT_SECRET) as any;
      const session = await this.getSession(validation.session);

      if (session != undefined) {
        return {
          sessionId: session.id,
          groupId: session.group,
          groupCategory: undefined,
          memberId: session.member
        } as AuthenticatedSessionModel;
      } else return undefined;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async updateLastSeen(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session != null) {
      if (
        getTimeDifferenceInMillis(session.lastSeen, new Date()) < Number.parseInt(process.env.SERVER_SESSION_TIMEOUT)
      ) {
        this.repository.updateLastSeen(sessionId);
      } else {
        this.deleteSession(sessionId);
      }
    }
  }
}
