import { getConnectionManager } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { GroupCollaboratorEntity } from './entity/group-collaborator.entity';
import { GroupEntity } from './entity/group.entity';

function getDefaultDatabaseConnectionSettings(): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: process.env.SERVER_DB_HOST,
    port: Number.parseInt(process.env.SERVER_DB_PORT),
    username: process.env.SERVER_DB_USER,
    password: process.env.SERVER_DB_PASSWORD,
    database: process.env.SERVER_DB_NAME,
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
