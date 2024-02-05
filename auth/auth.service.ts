import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthRegisterDTO } from "./DTO/auth-register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class AuthService{

    private issuer = 'login';
    private audience = 'users';

    constructor(
        private readonly jwtService: JwtService, 
        private readonly prismaService: PrismaService, 
        private readonly userService: UserService, 
        private readonly mailerService: MailerService) {}

    createToken(user: User){
        return {
            accessToken: this.jwtService.sign({
                id: user.id,
                name: user.username,
                email: user.email
            },{
                expiresIn: "7 Days",
                subject: String(user.id),
                issuer: this.issuer,
                audience: this.audience
            })
        }
    }

    verifyToken(token: string){
        try{
            const data = this.jwtService.verify(token, {
                    audience: 'users',
                    issuer: 'login'
            });

            return data;
        } catch(exception){
            throw new BadRequestException(exception);
        }
    }

    isInvalidToken(token: string){
        try{
            this.verifyToken(token);
            return true;
        } catch(exception){
            return false;
        }
    }

    async login(email: string, password: string){
        const user = await this.prismaService.user.findFirst({
            where:{
                email
            }
        });

        if(!user){
            throw new UnauthorizedException('Email e/ou senha incorretos.');
        }

        if(!await bcrypt.compare(password, user.password)){
            throw new UnauthorizedException('Email e/ou senha incorretos.');
        }

        return this.createToken(user);
    }

    async forget(email: string){
        const user = await this.prismaService.user.findFirst({
            where:{
                email
            }
        });

        if(!user){
            throw new UnauthorizedException('Email esta incorreto.');
        }

        const token = this.jwtService.sign({
            id: user.id,
        }, {
            expiresIn: "30 minutes",
            subject: String(user.id),
            issuer: 'forget',
            audience: 'users'
        })

        await this.mailerService.sendMail({
            subject: "Recuperação de senha",
            to: "heitor@hotmail.com",
            template: 'forget',
            context:{
                name: user.username,
                token 
            }
        });

        return true;
    }

    async reset(password: string, token: string){
        
        try{
            const data: any = this.jwtService.verify(token, {
                issuer: 'forget',
                audience: 'users'
            });

            if(isNaN(Number(data.id))){
                throw new BadRequestException("Token inválido")
            }

            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(password, salt);

            const user = await this.prismaService.user.update({
                where: {
                    id: Number(data.id),
                },
                data: {
                    password
                }
            });
    
            return this.createToken(user);

        } catch(exception){
            throw new BadRequestException(exception);
        }

    }

    async register(data: AuthRegisterDTO){
        const user = await this.userService.createUser(data);

        return this.createToken(user);
    }

}