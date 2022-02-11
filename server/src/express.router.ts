import { Express, NextFunction, Request, Response, Router } from 'express';
import AccountController from './controller/account.controller';

export default class ExpressRouter {
  public router: Router;
  private app: Express;

  constructor(app: Express) {
    this.router = Router();
    this.app = app;
  }

  public init(): void {
    this.router.post('/account/create', AccountController.create);
    this.router.post('/account/token', AccountController.getToken);
    this.app.use('/', this.router);
  }
}
