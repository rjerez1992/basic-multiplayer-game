import * as dotenv from 'dotenv';
import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express';
import ExpressRotuer from './express.router';
import { Account } from './entity/account';
import { Board } from './entity/board';
import { Character } from './entity/character';
import {
    Connection,
    ConnectionOptions,
    createConnection,
    createConnections
    } from 'typeorm';
import { RequestProcessor } from './utility/request-processor';
import 'reflect-metadata';

class App {
    public board: Board;
    public wss: WebSocket.Server;
    public loggedAccounts: any[];

    private clientIdCounter: number = 0;

    constructor() {
        this.run();
    }

    async run() {
        dotenv.config();

        const options: ConnectionOptions = {
            type: "sqlite",
            database: "./db.sqlite",
            entities: [Account, Character],
            synchronize: true
        }
        const connection: Connection = await createConnection(options);

        const app = express();
        app.use(express.json());
        const expressRoutes = new ExpressRotuer(app);
        expressRoutes.init();

        const server = http.createServer(app);
        this.wss = new WebSocket.Server({ server });

        this.board = new Board(
            parseInt(process.env.BOARD_HEIGHT ?? "20"),
            parseInt(process.env.BOARD_WIDTH ?? "20"
            ));

        this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            (ws as any).id = this.clientIdCounter++;
            console.info(`New client logged in with id ${(ws as any).id}`);

            ws.on('message', (message: string) => {
                RequestProcessor.process(message, ws);
            });

            ws.on('close', function close() {
                let account: Account = (ws as any).account;
                RequestProcessor.accountCleanup(account);
                console.info(`Client with id ${(ws as any).id} disconnected`);
            });
        });

        server.listen(process.env.PORT || 80, () => {
            console.log('Server started on port ' + (process.env.PORT || 80));
        });
    }
}

export default new App();