import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Board.css';

//NOTE: Must be in sync with css properties
//TODO: Retrieve from the server
const boardHeight = 8;
const boardWidth = 8;

//TODO: convert to component schema
export default function Board(){
    let WS_URL : string = process.env.REACT_APP_AUTH_WS_URL || "ws://localhost:8080";
    let navigate = useNavigate();
    let ws: WebSocket;
    let socketInitialized: boolean = false;
    let board : any[] = [];
    let flip = 1;

    let sessionToken = localStorage.getItem("sessionToken");
    if(!sessionToken){
        navigate("/");
    }
    //TODO Check if session token is stored else return to first page!

    function initWebsocket(){
        if(socketInitialized)
            return;
        socketInitialized = true;

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("Connection established with client");
            //login
            let action = {action: 1001, params: {token: sessionToken}};
            ws.send(JSON.stringify(action));
        }
    
        ws.onmessage = (message) => {
            console.log("message received: "+message.data);
            let action = JSON.parse(message.data);
            if(action.action === 5001){
                console.log("Player moved!");
                //TODO: Update player on board
            }
            else if(action.action === 5002){
                console.log("Player left!");
                //TODO: Remove player from board
            }
            else if(action.action === 5003){
                console.log("Board config received");
                //TODO: Print board with players indicated.
                //TODO: Put players on board 
                populateBoard();
                console.log(board);
            }

        }
    
        ws.onerror = () => {
            console.log("socket error");
            //show swal and then redirect to start
            navigate("/");
        }
    
        ws.onclose = () => {
            console.log("socket closed")
            navigate("/");
        }
    }

    function populateBoard(){
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                if(flip % 2 === 0)
                    board.push(<div className="tile tile-light">{i}-{j}</div>);
                else
                    board.push(<div className="tile tile-dark">{i}-{j}</div>);
                flip++;
            }        
            flip++;
        }
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

    
     

    

    return <div id="board" contentEditable={true} onKeyDown={keyDownHandler}>{board}</div>
}
