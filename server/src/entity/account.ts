import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import * as crypto from "crypto";

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    sessionToken: string;

    @Column()
    isLoggedIn: boolean;

    public constructor(username: string){
        this.username = username;
        this.sessionToken = "";
        this.isLoggedIn = false;
    }

    static generateToken (): string{
        return crypto.randomBytes(64).toString('hex');
    }
}