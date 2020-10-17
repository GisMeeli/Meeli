import { getConnectionManager } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { GroupCollaboratorEntity } from './entity/group-collaborator.entity';
import { GroupEntity } from './entity/group.entity';

function getDefaultDatabaseConnectionSettings(): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [GroupEntity, GroupCollaboratorEntity]
  };
}

export async function getDatabaseConnection() {
  const connectionManager = getConnectionManager();

  if (!connectionManager.has('default')) {
    connectionManager.create(getDefaultDatabaseConnectionSettings());
  }
  const connection = connectionManager.get();
  if (!connection.isConnected) await connection.connect();

  return connection;
}
