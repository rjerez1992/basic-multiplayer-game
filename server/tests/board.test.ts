import { Board } from "../src/entity/board";
import { Character } from "../src/entity/character";
import { BoardMovementDirection } from "../src/utility/movement.enum";

let mockBoard: Board;
let character: Character;

describe('Board movement validation', () => {
    test('Adding character when board is full', () => {
        mockBoard = new Board(2, 2);
        expect(mockBoard.add(new Character())).toBe(true);
        expect(mockBoard.add(new Character())).toBe(true);
        expect(mockBoard.add(new Character())).toBe(true);
        expect(mockBoard.add(new Character())).toBe(true);
        //NOTE: Since there are only 4 spaces, 5th player must fail
        expect(mockBoard.add(new Character())).toBe(false);
    });
    test('Moving character outside the bounds', () => {
        mockBoard = new Board(2, 2);
        character = new Character();
        mockBoard.add(character);
        mockBoard.move(character, BoardMovementDirection.UP);
        mockBoard.move(character, BoardMovementDirection.UP);
        expect(mockBoard.move(character, BoardMovementDirection.UP)).toBe(false);
    });
    test('Correct character add/removal', () => {
        mockBoard = new Board(2, 2);
        character = new Character();
        mockBoard.add(character);
        expect(mockBoard.characters().length).toBe(1);
        mockBoard.remove(character);
        expect(mockBoard.characters().length).toBe(0);
    });
});
  