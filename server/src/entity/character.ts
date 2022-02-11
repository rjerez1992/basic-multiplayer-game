import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne} from "typeorm";
import { Account } from "./Account";
import { BoardElement } from "./BoardElement";

@Entity()
export class Character extends BoardElement{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Account)
    @JoinColumn()
    account: Account;
}