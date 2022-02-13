import Swal from 'sweetalert2/src/sweetalert2.js';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Home.css';
import '@sweetalert2/theme-dark/dark.css';

let API_URL: string = process.env.REACT_APP_AUTH_API_URL || "http://localhost:8080";
const SweetAlert = withReactContent(Swal);

export default function Home() {
    let navigate = useNavigate();

    function onClickLogin() {
        let username = sessionStorage.getItem("username");

        try {
            if (!username) {
                createAccount(username);
            }
            else {
                getAccountToken(username);
            }
        }
        catch(e){
            SweetAlert.fire("Unable to connect to server")
                .then((result) => {
                    window.location.reload();
                });
        }
    }

    function createAccount(usr: any) {
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
                sessionStorage.setItem("username", data.username);
                getAccountToken(data.username);
            });
    }

    function getAccountToken(usr: any) {
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
                sessionStorage.setItem("sessionToken", data.sessionToken);
                navigate("/board");
            });
    }

    return <div id="home">
        <button id="enter-button" onClick={onClickLogin}>
            Join game
        </button>
    </div>
}