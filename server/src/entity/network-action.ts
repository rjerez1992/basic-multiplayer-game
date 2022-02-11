import { InputAction, OutputAction } from "../utility/actions.enum";

export interface INetworkAction {
    action: InputAction | OutputAction;
    params: any;
}