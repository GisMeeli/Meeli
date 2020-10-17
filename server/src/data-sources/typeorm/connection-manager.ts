import { getConnectionManager } from 'typeorm';
import { ormConfig } from './config';

export async function getDatabaseConnection() {
  const connectionManager = getConnectionManager();

  if (!connectionManager.has('default')) {
    connectionManager.create(ormConfig);
  }

  const connection = connectionManager.get();
  if (!connection.isConnected) await connection.connect();

  return connection;
}
