import * as dotenv from 'dotenv';
import express from 'express';
import ExpressRotuer from './express.router';
import "reflect-metadata";
import * as WebSocket from 'ws';
import * as http from 'http';
import {createConnection, createConnections, Connection, ConnectionOptions} from "typeorm";
import { Account } from './entity/account';
import { Character } from './entity/character';
import { Board } from './entity/Board';

async function main(){
    dotenv.config();

    const options: ConnectionOptions = {
        type: "sqlite",
        database: "./db.sqlite",
        entities: [ Account, Character ],
        synchronize: true
    }
    const connection: Connection = await createConnection(options);

    const app = express();
    app.use(express.json());
    const expressRoutes = new ExpressRotuer(app);
    expressRoutes.init();

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });   

    //Read from environment
    const board = new Board(parseInt(process.env.BOARD_HEIGHT ?? "10"), 
        parseInt(process.env.BOARD_WIDTH ?? "10"));

    //TODO: https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
    //TODO: Move to another class and start working on interaction
    /*
    - Request to join using token (must create character if not exists and add to board if space available)
    - Request to move the character
    - Request to get board state
    - Notification when character joined/moved
    - Notification when character left
    */
    wss.on('connection', (ws: WebSocket) => {

        ws.on('message', (message: string) => {
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);
        });

        ws.on('close', function close() {
            console.log('disconnected');
        });

        ws.send('Hi there, I am a WebSocket server');
    });

    server.listen(process.env.PORT || 80, () => {
        console.log('Server started on port '+ (process.env.PORT || 80));
    });
}

main().catch(console.error);