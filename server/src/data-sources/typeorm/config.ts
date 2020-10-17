import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { GroupCollaboratorEntity } from './entity/group-collaborator.entity';
import { GroupEntity } from './entity/group.entity';

export default {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [GroupEntity, GroupCollaboratorEntity]
} as PostgresConnectionOptions;
