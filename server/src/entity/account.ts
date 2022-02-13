import { Entity, PrimaryGeneratedColumn, Column, getRepository, JoinColumn, OneToOne } from "typeorm";
import * as crypto from "crypto";
import { Character } from "./character";

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    sessionToken: string;

    @OneToOne(() => Character, { eager: true })
    @JoinColumn()
    character: Character;

    isLoggedIn: boolean;

    public constructor(username: string) {
        this.username = username;
        this.sessionToken = "";
        this.isLoggedIn = false;
    }

    public static generateToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    public static async getAccountByToken(accountToken: string): Promise<Account | undefined> {
        const accountRepository = getRepository(Account);
        return accountRepository.findOne({ where: { sessionToken: accountToken } });
    }

    public async saveChanges() {
        const accountRepository = getRepository(Account);
        await accountRepository.save(this);
    }
}