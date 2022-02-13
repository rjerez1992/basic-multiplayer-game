export class BoardElement {
    public x: number;
    public y: number;
    public blocksMovement: boolean;

    public constructor() {
        this.x = 0;
        this.y = 0;
        this.blocksMovement = true;
    }
}