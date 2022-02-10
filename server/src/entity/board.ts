import { BoardElement } from "./boardElement";

export class Board {
    height: number;
    width: number;
    tiles: any[]

    public constructor(height: number, width:number){
        this.height = height;
        this.width = width;
        this.setupTiles();
    }

    private setupTiles(){
        for (let i = 0; i < this.height; i++) {
            const row = [];
            for (let j = 0; j < this.width; j++) {
                //NOTE: Improve with board element empty
                row.push(null);
            }   
            this.tiles.push(row);
        }
    }
}