import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { GroupsRouter } from './routes/groups.route';
import { TestsRouter } from './routes/tests.route';
import { GroupsService } from './services/groups.service';
import { GroupsDao } from './data-sources/typeorm/dao/groups.dao';
import morgan from 'morgan';
import * as http from 'http';
import * as ws from 'websocket';
import { SessionsService } from './services/sessions.service';
import { SessionsDao } from './data-sources/redis/sessions.dao';

export class MeeliServer {
  private app: Application;
  private httpServer: http.Server;
  private wsServer: ws.server;
  private port = process.env.SERVER_PORT || 8000;

  constructor() {
    this.setupRestServer();
    this.setupHttpServer();
    this.setupWSServer();
  }

  private setupRestServer() {
    const groupsService = new GroupsService(new GroupsDao());
    const sessionsService = new SessionsService(new SessionsDao());
    this.app = express()
      .use(bodyParser.json())
      .use(morgan('dev'))
      .use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
        );
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
      })
      .get('/', (req: Request, res: Response) => {
        res.send('<h1>Hello, world!</h1>');
      })
      .use('/groups', GroupsRouter(groupsService, sessionsService))
      .use('/tests', TestsRouter(groupsService, sessionsService));
  }

  private setupHttpServer() {
    this.httpServer = http
      .createServer(this.app)
      .listen(this.port)
      .on('listening', (): void => {
        console.log(`Server listening on port ${this.port}`);
      })
      .on('error', (error: NodeJS.ErrnoException): void => {
        if (error.syscall !== 'listen') throw error;

        let bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;

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
  }

  private setupWSServer() {
    this.wsServer = new ws.server({
      httpServer: this.httpServer,
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
  }
}
