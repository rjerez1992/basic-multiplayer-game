import { WebSocket } from "ws";
import app from "../app";
import { Account } from "../entity/account";
import { Character } from "../entity/character";
import { INetworkAction } from "../entity/network-action";
import { InputAction, OutputAction } from "./actions.enum";

export class RequestProcessor {
    constructor(){}

    static Process(message: string, source: WebSocket){
        let networkAction: INetworkAction;

        try {
            networkAction = JSON.parse(message);
        } catch (e) {
            return this.OnParsingError(message, source);
        }

        console.info(`Action received ${networkAction.action} from client ${(source as any).id}`);
        this.Execute(networkAction, source);
    }

    private static async Execute(action: INetworkAction, source: WebSocket){
        switch (action.action) {
            case InputAction.JOIN:{
                let token: string = action.params.token;
                let account = await Account.getAccountByToken(token);

                if(!account || token === "")
                    return this.OnCommonError("Invalid account token. Did you logged first?", source);
                if(account.isLoggedIn)
                    return this.OnCommonError("Account already logged in", source);
                if(!app.board.Add(account.character)){
                    return this.OnCommonError("Board has not space available", source);
                }
                
                //TODO: Store on a dictionary
                (source as any).account = account;
                //NOTE: IsLoggedIn might be an instance parameter instead of db
                account.isLoggedIn = true;
                account.saveChanges();

                RequestProcessor.BroadcastMovement(account.character);
                break;
            }

            case InputAction.MOVE:{
                let account = (source as any).account;

                //TODO: Differentiate errors from fatal errors. Fatal errors should disconnect the client (?)
                if(!account)
                    return this.OnCommonError("Account must join before moving", source);
                if(!action.params.direction)
                    return this.OnCommonError("Movement direction is invalid", source);
                if(!app.board.Move(account.character, action.params.direction))
                    return this.OnCommonError("Unable to move to desire direction", source);
            
                RequestProcessor.BroadcastMovement(account.character);
                break;
            }

            case InputAction.LEAVE: {
                //TODO: Remove account from socket and or close socket
                let account = (source as any).account;
                /*account.sessionToken= "";
                account.isLoggedIn = false;
                account.saveChanges();*/

                RequestProcessor.BroadcastLeave(account.character);
                source.close();
                break;
            }
            default:
                return this.OnUnkownAction(action, source);
                break;
        }
    }

    public static BroadcastMovement(character: Character){
        let outputAction: INetworkAction = {
            action : OutputAction.CHR_MOVED,
            params: { characterId: character.id, x: character.x, y: character.y }
        }

        app.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(outputAction));
            }
        });
    }

    public static BroadcastLeave(character: Character){
        let outputAction: INetworkAction = {
            action : OutputAction.CHR_LEFT,
            params: { characterId: character.id }
        }

        app.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(outputAction));
            }
        });
    }

    public static OnCommonError(message: string, source: WebSocket){
        let output: INetworkAction = {
            action: OutputAction.ERROR,
            params: {
                message: message,
            }
        }
        source.send(JSON.stringify(output));
    }

    private static OnUnkownAction(networkAction: INetworkAction, source: WebSocket){
        let output: INetworkAction = {
            action: OutputAction.ERROR,
            params: {
                message: "Unsupported network action",
                received: networkAction.action
            }
        }
        source.send(JSON.stringify(output));
    }

    private static OnParsingError(message: string, source: WebSocket){
        let output: INetworkAction = {
            action: OutputAction.ERROR,
            params: {
                message: "Error parsing incoming action",
                received: message
            }
        }
        source.send(JSON.stringify(output));
    }
}