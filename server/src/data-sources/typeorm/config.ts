import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { GroupCollaboratorEntity } from './entity/group-collaborator.entity';
import { GroupEntity } from './entity/group.entity';

export default {
  type: 'postgres',
  host: process.env.SERVER_DB_HOST,
  port: Number.parseInt(process.env.SERVER_DB_PORT),
  username: process.env.SERVER_DB_USER,
  password: process.env.SERVER_DB_PASSWORD,
  database: process.env.SERVER_DB_NAME,
  synchronize: true,
  logging: true,
  entities: [GroupEntity, GroupCollaboratorEntity]
} as PostgresConnectionOptions;
