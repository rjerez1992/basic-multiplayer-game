import app from '../app';
import { Account } from '../entity/account';
import { Character } from '../entity/character';
import { INetworkAction } from '../entity/network-action';
import { InputAction } from './input-action.enum';
import { OutputAction } from './output-action.enum';
import { WebSocket } from 'ws';

export class RequestProcessor {
    constructor() { }

    static process(message: string, source: WebSocket) {
        let networkAction: INetworkAction;

        try {
            networkAction = JSON.parse(message);
        } catch (e) {
            return this.onParsingError(message, source);
        }

        console.info(`Action received ${networkAction.action} from client ${(source as any).id}`);
        this.execute(networkAction, source);
    }

    static accountCleanup(account: Account) {
        if (account) {
            account.isLoggedIn = false;
            account.sessionToken = "";
            account.saveChanges();
            if (account.character) {
                app.board.remove(account.character);
                RequestProcessor.broadcastLeave(account.character);
            }
        }
    }

    private static async execute(action: INetworkAction, source: WebSocket) {
        switch (action.action) {
            case InputAction.JOIN: {
                let token: string = action.params.token;
                let account = await Account.getAccountByToken(token);

                if (!account || token === "")
                    return this.onCommonError("Invalid account token. Did you logged first?", source, true);
                if (account.isLoggedIn)
                    return this.onCommonError("Account already logged in", source, true);
                if (!app.board.add(account.character)) {
                    return this.onCommonError("Board has not space available", source, true);
                }

                (source as any).account = account;
                account.isLoggedIn = true;
                account.saveChanges();

                RequestProcessor.sendInitialData(source);
                RequestProcessor.broadcastMovement(account.character);
                break;
            }

            case InputAction.MOVE: {
                let account = (source as any).account;

                if (!account)
                    return this.onCommonError("Account must join before moving", source, true);
                if (!action.params.direction)
                    return this.onCommonError("Movement direction is invalid", source);
                if (!app.board.move(account.character, action.params.direction))
                    return this.onCommonError("Unable to move to desire direction", source);

                RequestProcessor.broadcastMovement(account.character);
                break;
            }

            case InputAction.LEAVE: {
                let account = (source as any).account;
                RequestProcessor.accountCleanup(account);
                delete (source as any).account
                source.close();
                break;
            }
            default:
                return this.onUnkownAction(action, source);
                break;
        }
    }

    private static sendInitialData(source: WebSocket) {
        let output: INetworkAction = {
            action: OutputAction.BOARD_CONFIG,
            params: {
                boardHeight: app.board.height,
                boardWidth: app.board.width,
                boardPlayers: app.board.characters()
            }
        }
        source.send(JSON.stringify(output));
    }

    public static broadcastMovement(character: Character) {
        let outputAction: INetworkAction = {
            action: OutputAction.CHR_MOVED,
            params: { characterId: character.id, x: character.x, y: character.y }
        }

        app.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(outputAction));
            }
        });
    }

    public static broadcastLeave(character: Character) {
        let outputAction: INetworkAction = {
            action: OutputAction.CHR_LEFT,
            params: { characterId: character.id }
        }

        app.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(outputAction));
            }
        });
    }

    public static onCommonError(message: string, source: WebSocket, isFatal: boolean = false) {
        let output: INetworkAction = {
            action: isFatal ? OutputAction.FATAL_ERROR : OutputAction.ERROR,
            params: {
                message: message,
            }
        }
        source.send(JSON.stringify(output));
        if (isFatal)
            source.close();
    }

    private static onUnkownAction(networkAction: INetworkAction, source: WebSocket) {
        let output: INetworkAction = {
            action: OutputAction.ERROR,
            params: {
                message: "Unsupported network action",
                received: networkAction.action
            }
        }
        source.send(JSON.stringify(output));
    }

    private static onParsingError(message: string, source: WebSocket) {
        let output: INetworkAction = {
            action: OutputAction.FATAL_ERROR,
            params: {
                message: "Error parsing incoming action",
                received: message
            }
        }
        source.send(JSON.stringify(output));
        source.close();
    }
}