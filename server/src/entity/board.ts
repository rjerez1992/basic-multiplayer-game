import { BoardMovementDirection } from "../utility/movement.enum";
import { Character } from "./character";

export class Board {
    height: number;
    width: number;
    tiles: any[]

    public constructor(height: number, width:number){
        this.height = height;
        this.width = width;
        this.setupTiles();
    }

    private setupTiles(): void{
        this.tiles = [];

        for (let i = 0; i < this.height; i++) {
            const row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(undefined);
            }   
            this.tiles.push(row);
        }
    }

    public Add(character: Character): boolean {
        let emptySlot = this.getEmptySlot();

        if(!emptySlot)
            return false;

        this.MoveTo(character, emptySlot.column, emptySlot.row);
        return true;
    }

    //TODO: Reduce using a function to encaptsulate the CanMoveTo if
    //NOTE: Movement can be improved using a locking on the resource
    public Move(character: Character, direction: BoardMovementDirection): boolean {
        switch (direction) {
            case BoardMovementDirection.UP:{
                if(this.CanMoveTo(character, character.x, character.y+1)){
                    this.MoveTo(character, character.x, character.y+1);
                    return true;
                }
                break; 
            }
            case BoardMovementDirection.DOWN:{
                if(this.CanMoveTo(character, character.x, character.y-1)){
                    this.MoveTo(character, character.x, character.y-1);
                    return true;
                }
                break; 
            }
            case BoardMovementDirection.LEFT:{
                if(this.CanMoveTo(character, character.x-1, character.y)){
                    this.MoveTo(character, character.x-1, character.y);
                    return true;
                }
                break; 
            }
            case BoardMovementDirection.UP:{
                if(this.CanMoveTo(character, character.x+1, character.y)){
                    this.MoveTo(character, character.x+1, character.y);
                    return true;
                }
                break; 
            }
            default:
                return false;
                break;
        }
        return false;
    }

    private MoveTo(character: Character, x: number, y:number){
        character.x = x;
        character.y = y;
        this.tiles[character.x][character.y] = character;
    }

    private CanMoveTo(character: Character, x:number, y:number): boolean{
        //NOTE: Check order - Bounds > Empty? > Range
        return (x >= 0 && x < this.width && y >= 0 && y < this.height) &&
            !(this.tiles[x][y] && this.tiles[x][y].blocksMovement) && 
            (Math.abs(character.x - x) <= 1 && Math.abs(character.y - y) <= 1);
    }

    private getEmptySlot(): any {
        let emptySlots = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if(!this.tiles[i][j])
                    emptySlots.push({row: i, column: j});
            }   
        }
        if(emptySlots.length < 1)
            return undefined;
        return emptySlots[Math.floor(Math.random() * emptySlots.length)];
    }
}