import * as http from 'http';
import App from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.SERVER_PORT || 8000;
App.set('port', port);

http
  .createServer(App)
  .listen(port)
  .on('listening', (): void => {
    console.log(`Server listening on port ${port}`);
  })
  .on('error', (error: NodeJS.ErrnoException): void => {
    if (error.syscall !== 'listen') throw error;

    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
      default:
        throw error;
    }
  });
