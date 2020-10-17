import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { GroupsRouter } from './routes/groups.route';
import { GroupsService } from './services/groups.service';
import { GroupsDao } from './data-sources/typeorm/dao/groups.dao';

/**
 * App de Express.
 */
export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  public config() {
    this.app.use(bodyParser.json());
    this.app.use(morgan('dev'));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
  }

  public routes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.send('<h1>Hello, world!</h1>');
    });

    this.app.use('/groups', GroupsRouter(new GroupsService(new GroupsDao())));
  }
}

export default new App().app;
