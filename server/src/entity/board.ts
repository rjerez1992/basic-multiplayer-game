import { BoardMovementDirection } from "../utility/movement.enum";
import { Character } from "./character";

export class Board {
    height: number;
    width: number;
    tiles: any[]

    public constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
        this.setupTiles();
    }

    private setupTiles(): void {
        this.tiles = [];

        for (let i = 0; i < this.height; i++) {
            const row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(undefined);
            }
            this.tiles.push(row);
        }
    }

    public add(character: Character): boolean {
        let emptySlot = this.getEmptySlot();
        if (emptySlot === undefined || emptySlot.length < 1){
            return false;
        }  
        character.x = emptySlot.row;
        character.y = emptySlot.column;
        this.tiles[character.x][character.y] = character;
        return true;
    }

    public remove(character: Character): boolean {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.tiles[i][j] != undefined && this.tiles[i][j] instanceof Character && this.tiles[i][j].id === character.id)
                    this.tiles[i][j] = undefined;
            }
        }
        return true;
    }

    public characters(): any[] {
        let characters = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.tiles[i][j] !== undefined)
                    characters.push({characterId: this.tiles[i][j].id, x: this.tiles[i][j].x, y: this.tiles[i][j].y});
            }
        }
        return characters;
    }

    //NOTE: Movement can be improved using a locking on the resource
    public move(character: Character, direction: BoardMovementDirection): boolean {
        switch (direction) {
            case BoardMovementDirection.UP: {
                return this.processMovement(character, 0, 1);
                break;
            }
            case BoardMovementDirection.DOWN: {
                return this.processMovement(character, 0, -1);
                break;
            }
            case BoardMovementDirection.LEFT: {
                return this.processMovement(character, -1, 0);
                break;
            }
            case BoardMovementDirection.RIGHT: {
                return this.processMovement(character, 1, 0);
                break;
            }
            default:
                return false;
                break;
        }
        return false;
    }

    private processMovement(character: Character, xSteps: number, ySteps: number): boolean {
        if (this.canMoveTo(character, character.x + xSteps, character.y + ySteps)) {
            this.moveTo(character, character.x + xSteps, character.y + ySteps);
            return true;
        }
        return false;
    }

    private moveTo(character: Character, x: number, y: number) {
        this.tiles[character.x][character.y] = undefined;
        character.x = x;
        character.y = y;
        this.tiles[character.x][character.y] = character;
    }

    private canMoveTo(character: Character, x: number, y: number): boolean {
        //NOTE: Check order - Bounds > Available > Range
        return (x >= 0 && x < this.width && y >= 0 && y < this.height) &&
            !(this.tiles[x][y] && this.tiles[x][y].blocksMovement) &&
            (Math.abs(character.x - x) <= 1 && Math.abs(character.y - y) <= 1);
    }

    private getEmptySlot(): any {
        let emptySlots = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.tiles[i][j] === null || this.tiles[i][j] === undefined){
                    emptySlots.push({ row: i, column: j });
                } 
            }
        }
        if (emptySlots.length < 1)
            return undefined;
        return emptySlots[Math.floor(Math.random() * emptySlots.length)];
    }
}