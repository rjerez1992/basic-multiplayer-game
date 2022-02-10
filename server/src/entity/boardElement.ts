export class BoardElement {
    public x: number;
    public y: number;
    public blocksMovement: boolean;

    public constructor(x: number, y: number, blocksMovement: boolean = true) {
        this.x = x;
        this.y = y;
        this.blocksMovement = blocksMovement;
    }
}