import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2/src/sweetalert2.js';
import withReactContent from 'sweetalert2-react-content';
import { BoardMovementDirection } from '../../enums/movement.enum';
import { ClientAction } from '../../enums/client-action.enum';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { ReactComponent as Char1Svg } from '../../assets/images/char1.svg';
import { ReactComponent as Char2Svg } from '../../assets/images/char2.svg';
import { ReactComponent as Char3Svg } from '../../assets/images/char3.svg';
import { ReactComponent as Char4Svg } from '../../assets/images/char4.svg';
import { ServerAction } from '../../enums/server-action';
import './Board.css';
import '@sweetalert2/theme-dark/dark.css';


const SweetAlert = withReactContent(Swal);
const WS_URL: string = process.env.REACT_APP_AUTH_WS_URL || "ws://localhost:8080";

let boardHeight = 8;
let boardWidth = 8;
let socketInitialized: boolean = false;
let ws: WebSocket;
let logicBoard: any[];
let boardInitialized = false;
let navigate: NavigateFunction;
let triggeredDisconnection = false;
let sessionToken: string | null;

function initialBoardPulation(width: number, height: number, players: any[]) {
    boardWidth = width;
    boardHeight = height;

    logicBoard = [];

    for (let i = 0; i < boardHeight; i++) {
        let row = [];
        for (let j = 0; j < boardWidth; j++) {
            row.push(undefined);
        }
        logicBoard.push(row);
    }

    for (let i = 0; i < players.length; i++) {
        logicBoard[players[i].x][players[i].y] = players[i];
    }

    boardInitialized = true;
}

function updateLogicBoardMovement(player: any) {
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (logicBoard[i][j] !== undefined && logicBoard[i][j].characterId === player.characterId) {
                logicBoard[i][j] = undefined;
            }
        }
    }
    logicBoard[player.x][player.y] = player;
}

function updateLogicBoardLeft(player: any) {
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (logicBoard[i][j] !== undefined && logicBoard[i][j].characterId === player.characterId) {
                logicBoard[i][j] = undefined;
            }
        }
    }
}

function showAlertOnError(message: string, callback: () => any) {
    SweetAlert.fire(message)
        .then((result) => {
            callback();
        });
}

function cleanupCredentialsAndRedirect() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("sessionToken");
    navigate("/");
}

export default function Board() {
    navigate = useNavigate();
    let boardArray: any[] = [];
    const [board, setBoard] = useState(boardArray);

    const initWebsocket = () => {
        if (socketInitialized)
            return;
        socketInitialized = true;

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("Connection established with client");
            //NOTE: Sends login request
            let action = { action: ClientAction.JOIN, params: { token: sessionToken } };
            ws.send(JSON.stringify(action));
        }

        ws.onmessage = (message) => {
            let action = JSON.parse(message.data);

            if (action.action === ServerAction.ERROR) {
                console.log("Error received from server");
                console.log(action.params);
            }
            else if (action.action === ServerAction.CHR_MOVED) {
                console.log("Server updated player movement");
                updateLogicBoardMovement(action.params);
                buildBoardRepresentation();
            }
            else if (action.action === ServerAction.CHR_LEFT) {
                console.log("Server updated player left");
                updateLogicBoardLeft(action.params);
                buildBoardRepresentation();
            }
            else if (action.action === ServerAction.BOARD_CONFIG) {
                console.log("Board config received. Initial population");
                initialBoardPulation(action.params.boardWidth, action.params.boardHeight, action.params.boardPlayers);
                buildBoardRepresentation();
            }
            else if (action.action === ServerAction.FATAL_ERROR) {
                console.log("Fatal error received from server");
                showAlertOnError(action.params.message, () => {
                    triggeredDisconnection = true;
                    ws.close();
                    cleanupCredentialsAndRedirect();
                });
            }
        }

        ws.onerror = () => {
            console.log("Socket error detected");
            showAlertOnError("Unexpected connection error", () => {
                triggeredDisconnection = true;
                ws.close();
                cleanupCredentialsAndRedirect();
            });
        }

        ws.onclose = () => {
            console.log("Socket closed detected");
            if (!triggeredDisconnection) {
                showAlertOnError("Unexpected connection close", () => {
                    cleanupCredentialsAndRedirect();
                });
            }
        }
    }

    const buildBoardRepresentation = () => {
        let tileWidth = 800 / boardWidth;
        let tileHeight = 800 / boardHeight;
        let key = 0;
        let flip = 1;
        let tmpBoard = [];
        for (let i = boardHeight - 1; i >= 0; i--) {
            for (let j = 0; j < boardWidth; j++) {
                if (logicBoard[j][i] === undefined) {
                    if (flip % 2 === 0)
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#2D333B", width: tileWidth + "px", height: tileHeight + "px" }}></div>);
                    else
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#22272E", width: tileWidth + "px", height: tileHeight + "px" }}></div>);
                }
                else {
                    if (logicBoard[j][i].characterId % 4 === 0)
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#CCCCCC", width: tileWidth + "px", height: tileHeight + "px" }}><Char1Svg /></div>);
                    else if (logicBoard[j][i].characterId % 4 === 1)
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#CCCCCC", width: tileWidth + "px", height: tileHeight + "px" }}><Char2Svg /></div>);
                    else if (logicBoard[j][i].characterId % 4 === 2)
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#CCCCCC", width: tileWidth + "px", height: tileHeight + "px" }}><Char3Svg /></div>);
                    else if (logicBoard[j][i].characterId % 4 === 3)
                        tmpBoard.push(<div id={key+""} key={key} style={{ backgroundColor: "#CCCCCC", width: tileWidth + "px", height: tileHeight + "px" }}><Char4Svg /></div>);
                }
                flip++;
                key++;
            }
            flip++;
        }
        setBoard(tmpBoard);
    }

    const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!socketInitialized)
            return;
        if (event.code === "ArrowUp") {
            let action = { action: ClientAction.MOVE, params: { direction: BoardMovementDirection.UP } };
            ws.send(JSON.stringify(action));

        }
        else if (event.code === "ArrowDown") {
            let action = { action: ClientAction.MOVE, params: { direction: BoardMovementDirection.DOWN } };
            ws.send(JSON.stringify(action));
        }
        else if (event.code === "ArrowLeft") {
            let action = { action: ClientAction.MOVE, params: { direction: BoardMovementDirection.LEFT } };
            ws.send(JSON.stringify(action));
        }
        else if (event.code === "ArrowRight") {
            let action = { action: ClientAction.MOVE, params: { direction: BoardMovementDirection.RIGHT } };
            ws.send(JSON.stringify(action));
        }
    };

    useEffect(() => {
        sessionToken = sessionStorage.getItem("sessionToken");
        if (!sessionToken) {
            navigate("/");
        }
        else{
            initWebsocket();
        }
        return () => {
            if (ws !== undefined)
                ws.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!boardInitialized) {
        <div><h3 style={{ color: "#FFFFFF" }}>Esperando configuración del tablero</h3></div>
    }
    return <div
        contentEditable={true}
        onKeyDown={keyDownHandler}
        suppressContentEditableWarning={true}
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(" + boardWidth + ", " + (800 / boardWidth) + "px)",
            gridTemplateRows: "repeat(" + boardHeight + ", " + (800 / boardHeight) + "px)",
            width: "800px",
            height: "800px",
            backgroundColor: "#c2c5aa"
        }}
    >
        {board}
    </div>
}
