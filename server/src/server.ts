import * as http from 'http';
import App from './app';
import dotenv from 'dotenv';
import * as ws from 'websocket';
dotenv.config();

const port = process.env.SERVER_PORT || 8000;
App.set('port', port);

const server = http
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

new ws.server({
  httpServer: server,
  autoAcceptConnections: false
})
  .on('request', (request: ws.request) => {
    console.log(request);
    request.resource;
    const connection = request.accept('meeli', request.origin);

    connection
      .on('message', (msg: ws.IMessage) => {
        connection.sendUTF(JSON.stringify({ message: 'Data was received!' }));
      })
      .on('close', (code: number, description: string) => {
        //
      })
      .on('error', (err: Error) => {
        console.log(err);
      });
  })
  .on('connect', (connection: ws.connection) => {
    console.log('Connection done!');
  })
  .on('close', (connection: ws.connection, reason: number, desc: string) => {
    console.log('Connection was closed!');
  });
