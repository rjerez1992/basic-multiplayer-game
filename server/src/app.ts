import * as dotenv from 'dotenv';
import express from 'express';
import ExpressRotuer from './express.router';
import "reflect-metadata";
import * as WebSocket from 'ws';
import * as http from 'http';

//TODO: https://typeorm.io/#/using-ormconfig
dotenv.config();

const app = express();
const expressRoutes = new ExpressRotuer(app);
expressRoutes.init();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
    ws.send('Hi there, I am a WebSocket server');
});

server.listen(process.env.PORT || 80, () => {
    console.log('Server started on port '+ (process.env.PORT || 80));
});
