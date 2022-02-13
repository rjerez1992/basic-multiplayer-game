import { InputAction } from "../utility/input-action.enum";
import { OutputAction } from "../utility/output-action.enum";

export interface INetworkAction {
    action: InputAction | OutputAction;
    params: any;
}