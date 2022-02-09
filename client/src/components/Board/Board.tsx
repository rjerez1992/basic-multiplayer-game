import React from "react";

import './Board.css';

//NOTE: Must be in sync with css properties
const boardHeight = 8;
const boardWidth = 8;

export default function Board(){
    let board = [];
    let flip = 1;

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