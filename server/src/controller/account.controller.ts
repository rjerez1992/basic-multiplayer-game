import { NextFunction, Request, Response } from 'express';
import { getRepository} from "typeorm";
import { Account } from '../entity/account';
import { Character } from '../entity/character';

export default class AccountController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        const accountRepository = getRepository(Account);  

        //NOTE: In a real world scenario this should be a db transaction
        let account = await accountRepository.findOne({ where: { username:req.body.username } });
        if(account){
            res.status(409);
            return res.send({message: "Account already exists"});
        }

        const characterRepository = getRepository(Character);  
        let character = new Character();
        character = await characterRepository.save(character);

        account = new Account(req.body.username);
        account.character = character;
        account = await accountRepository.save(account);
        
        res.send(account);
    }

    public static async getToken(req: Request, res: Response, next: NextFunction) {
        const accountRepository = getRepository(Account);        
        let account = await accountRepository.findOne({ where: { username:req.body.username } });

        if(!account){
            res.status(404);
            return res.send({message: "Account not found"});
        }
        if(account.isLoggedIn){
            res.status(400);
            return res.send({message: "Account already logged in"});
        }

        account.sessionToken = Account.generateToken();
        account = await accountRepository.save(account);
        res.send(account);  
    }
}
