import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { GroupsRouter } from './routes/groups.route';
import { TestsRouter } from './routes/tests.route';
import { GroupsService } from './services/groups.service';
import { GroupsDao } from './data-sources/typeorm/dao/groups.dao';
import morgan from 'morgan';
import * as http from 'http';
import * as https from 'https';
import * as ws from 'websocket';
import { SessionsService } from './services/sessions.service';
import { SessionsDao } from './data-sources/redis/sessions.dao';
import { MeeliService } from './services/meeli.service';
import { MeeliDao } from './data-sources/pg/meeli.dao';
import fs from 'fs';

export class MeeliServer {
  private app: Application;
  private httpServer: http.Server;
  private httpsServer: https.Server;
  private wsServer: ws.server;
  private httpPort = process.env.SERVER_HTTP_PORT || 8000;
  private httpsPort = process.env.SERVER_HTTPS_PORT || 8001;

  // Servicios
  private groupsService: GroupsService;
  private meeliService: MeeliService;
  private sessionsService: SessionsService;

  constructor() {
    this.setupServices();
    this.setupRestServer();
    this.setupHttpServer();
    this.setupHttpsServer();
    this.setupWSServer();
  }

  private setupServices() {
    this.groupsService = new GroupsService(new GroupsDao());
    this.meeliService = new MeeliService(new MeeliDao(), this.groupsService);
    this.sessionsService = new SessionsService(new SessionsDao());
  }

  private setupRestServer() {
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
      .use('/groups', GroupsRouter(this.groupsService, this.sessionsService))
      .use('/tests', TestsRouter(this.groupsService, this.sessionsService));
  }

  private setupHttpServer() {
    this.httpServer = http
      .createServer(this.app)
      .listen(this.httpPort)
      .on('listening', (): void => {
        console.log(`Server listening on port ${this.httpPort}`);
      })
      .on('error', (error: NodeJS.ErrnoException): void => {
        if (error.syscall !== 'listen') throw error;

        let bind = typeof this.httpPort === 'string' ? 'Pipe ' + this.httpPort : 'Port ' + this.httpPort;

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

  private setupHttpsServer() {
    const certsLocation = 'certs';
    const privateKey = fs.readFileSync(`${certsLocation}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`${certsLocation}/cert.pem`, 'utf8');
    const ca = fs.readFileSync(`${certsLocation}/chain.pem`, 'utf8');

    this.httpsServer = https
      .createServer(
        {
          key: privateKey,
          cert: certificate,
          ca: ca
        },
        this.app
      )
      .listen(this.httpsPort)
      .on('listening', (): void => {
        console.log(`Server listening on port ${this.httpsPort}`);
      })
      .on('error', (error: NodeJS.ErrnoException): void => {
        if (error.syscall !== 'listen') throw error;

        let bind = typeof this.httpsPort === 'string' ? 'Pipe ' + this.httpsPort : 'Port ' + this.httpsPort;

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
      httpServer: [this.httpServer, this.httpsServer],
      autoAcceptConnections: false
    })
      .on('request', async (request: ws.request) => {
        const token = request.resource.replace('/', '');

        if (token == 'guest') {
          const connection = request.accept('meeli', request.origin);
          connection
            .on('message', async (msg: ws.IMessage) => {
              const result = await this.meeliService.handleGuestRequest(msg);

              connection.sendUTF(JSON.stringify(result));
            })
            .on('close', (code: number, description: string) => {})
            .on('error', (err: Error) => {});
        } else {
          const auth = await this.sessionsService.authenticateSession(token);

          if (auth == undefined) {
            request.reject(401, 'Invalid session.');
          } else {
            auth.groupCategory = (await this.groupsService.getGroupById(auth.groupId)).category;

            const connection = request.accept('meeli', request.origin);

            this.meeliService.initializeMeeliSession(auth);

            connection
              .on('message', async (msg: ws.IMessage) => {
                const result = await this.meeliService.handleCollaboratorRequest(auth, msg);

                connection.sendUTF(JSON.stringify(result));
              })
              .on('close', (code: number, description: string) => {
                //
              })
              .on('error', (err: Error) => {
                console.log(err);
              });
          }
        }
      })
      .on('connect', (connection: ws.connection) => {
        console.log('Connection done!');
      })
      .on('close', (connection: ws.connection, reason: number, desc: string) => {
        console.log('Connection was closed!');
      });
  }
}
