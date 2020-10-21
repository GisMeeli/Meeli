import { MeeliServer } from './meeli-server';
import dotenv from 'dotenv';

dotenv.config();

const server = new MeeliServer();
export { server };
