import React, { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import './Board.css';

//NOTE: Must be in sync with css properties
const boardHeight = 8;
const boardWidth = 8;

export default function Board(){
    let board = [];
    let flip = 1;

    useEffect(() => {
        let usr = localStorage.getItem("username");

        if(!usr){
            usr = uuidv4();
            //Create account
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usr })
            };
            fetch('http://localhost:8081', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("Create account request result: ");
                console.log(data);
                console.log("user stored on localstorage");
                localStorage.setItem("username", (usr as string));
            });
        }
        else{
            console.log("username already registered as : "+usr);
        }
        //TODO: Login after ensure user is created and store session token on localstorage (?)

    }, []);

    //Reference: https://www.youtube.com/watch?v=Iri__zwxwHg
    //TODO: Make tiles into its own class
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

    return <div id="board">{board}</div>
}
