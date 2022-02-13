import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BoardElement } from "./board-element";

@Entity()
export class Character extends BoardElement {
    @PrimaryGeneratedColumn()
    id: number;
}