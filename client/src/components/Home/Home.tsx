import React, { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

export default function Home() {
    let API_URL : string = process.env.REACT_APP_AUTH_API_URL || "http://localhost:8080";
    let navigate = useNavigate();

    function onClickLogin(){
        let username = localStorage.getItem("username");

        if(!username){
            createAccount(username);
        }
        else{
            getAccountToken(username);
        }
    }

    function createAccount(usr: any){
        console.info(`Creating account for username: ${usr}`);
        usr = uuidv4();
        const requestOptions = {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usr })
        };
        fetch(API_URL + "/account/create", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(`Account created with username ${data.username}`);
            localStorage.setItem("username", data.username);
            getAccountToken(data.username);
        });
    }

    function getAccountToken(usr: any){
        console.info(`Obtaining session token for: ${usr}`);
        const requestOptions = {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usr })
        };
        fetch(API_URL + "/account/token", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(`Obtained token for account: ${data.sessionToken}`);
            localStorage.setItem("sessionToken", data.sessionToken);
            navigate("/board");
        });
    }

    useEffect(() => {
        console.log("Home useEffect called");
    }, []);

    return <div id="home">
            <button onClick={onClickLogin}>
                Enter game
            </button>
        </div>
}