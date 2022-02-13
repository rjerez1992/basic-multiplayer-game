import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Board.css';

//NOTE: Must be in sync with css properties
//TODO: Retrieve from the server
let boardHeight = 8;
let boardWidth = 8;
let socketInitialized: boolean = false;
let ws: WebSocket;
let WS_URL : string = process.env.REACT_APP_AUTH_WS_URL || "ws://localhost:8080";
let logicBoard: any[];
let boardInitialized = false;

function initialBoardPulation(width: number, height: number, players: any[]){
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

function updateLogicBoardMovement(player: any){
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if(logicBoard[i][j] !== undefined && logicBoard[i][j].characterId === player.characterId){
                //console.log("Found: "+JSON.stringify(logicBoard[i][j]) + " looking for: " + JSON.stringify(player));
                logicBoard[i][j] = undefined;
            }  
        }        
    }
    logicBoard[player.x][player.y] = player;
}

function updateLogicBoardLeft(player: any){
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if(logicBoard[i][j] !== undefined && logicBoard[i][j].characterId === player.characterId){
                //console.log("Found: "+JSON.stringify(logicBoard[i][j]) + " looking for: " + JSON.stringify(player));
                logicBoard[i][j] = undefined;
            } 
        }        
    }
}

//TODO: convert to component schema
export default function Board(){
    let navigate = useNavigate();
    let boardArray : any[] = [];
    const [board, setBoard] = useState(boardArray);
    
    let sessionToken = localStorage.getItem("sessionToken");
    if(!sessionToken){
        navigate("/");
    }

    const initWebsocket = () => {
        if(socketInitialized)
            return;
        socketInitialized = true;

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("Connection established with client");
            //NOTE: Sends login request
            let action = {action: 1001, params: {token: sessionToken}};
            ws.send(JSON.stringify(action));
        }
    
        ws.onmessage = (message) => {
            console.log("message received: "+message.data);
            let action = JSON.parse(message.data);

            if(action.action === 5000){
                console.log("Error received from server");
                console.log(action.params); 
                localStorage.removeItem("username");
                localStorage.removeItem("sessionToken");
                navigate("/");
            }
            else if(action.action === 5001){
                console.log("Player moved!");
                console.log(action.params);
                updateLogicBoardMovement(action.params);
                buildBoardRepresentation();
            }
            else if(action.action === 5002){
                console.log("Player left!");
                console.log(action.params);
                updateLogicBoardLeft(action.params);
                buildBoardRepresentation();
            }
            else if(action.action === 5003){
                console.log("Board config received. Initial population");
                console.log(action.params.boardPlayers);
                initialBoardPulation(action.params.boardWidth, action.params.boardHeight, action.params.boardPlayers);
                buildBoardRepresentation();                
            }
        }
    
        ws.onerror = () => {
            console.log("socket error");
            //TODO: show swal and then redirect to start
            navigate("/");
        }
    
        ws.onclose = () => {
            console.log("socket closed");
            //TODO: show swal and then redirect to start
            navigate("/");
        }
    }

    const buildBoardRepresentation = () =>{
        let tileWidth = 800/boardWidth;
        let tileHeight = 800/boardHeight;
        let key = 0;
        let flip = 1;
        let tmpBoard = [];
        for (let i = boardHeight-1; i >= 0; i--) {
            for (let j = 0; j < boardWidth; j++) {
                if(logicBoard[j][i] === undefined){
                    if(flip % 2 === 0)
                        tmpBoard.push(<div key={key} style={{backgroundColor: "#2D333B", width: tileWidth+"px", height: tileHeight+"px"}}>{i}-{j}</div>);
                    else
                        tmpBoard.push(<div key={key} style={{backgroundColor: "#22272E", width: tileWidth+"px", height: tileHeight+"px"}}>{i}-{j}</div>);
                }
                else{
                    console.log(logicBoard[j][i])
                    tmpBoard.push(<div key={key} style={{backgroundColor: "#CCCCCC", width: tileWidth+"px", height: tileHeight+"px"}}>Player ID:{logicBoard[j][i].characterId}</div>);
                }
                flip++;
                key++;
            }        
            flip++;
        }
        setBoard(tmpBoard);
    }

    const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if(!socketInitialized)
            return;
        if (event.code === "ArrowUp") {
            console.log("Arrow up pressed");
            let action = {action: 1002, params: {direction: 1}};
            ws.send(JSON.stringify(action));
            
        }

        if (event.code === "ArrowDown") {
            console.log("Arrow down pressed");
            let action = {action: 1002, params: {direction: 2}};
            ws.send(JSON.stringify(action));
        }

        if (event.code === "ArrowLeft") {
            console.log("Arrow left pressed");
            let action = {action: 1002, params: {direction: 3}};
            ws.send(JSON.stringify(action));
        }

        if (event.code === "ArrowRight") {
            console.log("Arrow right pressed");
            let action = {action: 1002, params: {direction: 4}};
            ws.send(JSON.stringify(action));  
        }
    };

    useEffect(() => {
        initWebsocket(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(!boardInitialized){
        <div>Esperando configuración del tablero</div>
    }
    return <div 
            contentEditable={true} 
            onKeyDown={keyDownHandler} 
            suppressContentEditableWarning={true} 
            style={{display: "grid", gridTemplateColumns: "repeat("+boardWidth+", "+(800/boardWidth)+"px)", gridTemplateRows: "repeat("+boardHeight+", "+(800/boardHeight)+"px)", width: "800px", height: "800px", backgroundColor: "#c2c5aa"}}
        >
            {board}
        </div>
}
