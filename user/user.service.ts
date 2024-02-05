import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./DTO/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./DTO/update-put-user.dto";
import { UpdatePatchUserDTO } from "./DTO/update-patch-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService{

    constructor(private prismaService: PrismaService){}

    async createUser(user: CreateUserDTO){

        const salt = await bcrypt.genSalt();

        user.password = await bcrypt.hash(user.password, salt);

        return this.prismaService.user.create({
            data: user,
        });
        
    }

    async list(){
        return this.prismaService.user.findMany()
    }

    async show(id: number){

        await this.existId(id);

        return this.prismaService.user.findUnique({
            where: {
                id
            }
        })
    }

    async update(userUpdatePut: UpdatePutUserDTO, id: number){
        
        await this.existId(id);
        
        const salt = await bcrypt.genSalt();

        userUpdatePut.password = await bcrypt.hash(userUpdatePut.password, salt);

        return this.prismaService.user.update({
            data: userUpdatePut,
            where: {
                id
            }
        })
    }

    async updatePartial(userUpdatePatch: UpdatePatchUserDTO, id: number){

        await this.existId(id);

        const salt = await bcrypt.genSalt();

        userUpdatePatch.password = await bcrypt.hash(userUpdatePatch.password, salt);
        
        return this.prismaService.user.update({
            data: userUpdatePatch,
            where: {
                id
            }
        })
    }

    async delete(id: number){

        await this.existId(id);

        return this.prismaService.user.delete({
            where: {
                id
            }
        });
    }

    async existId(id: number){
        if(!(await this.prismaService.user.count({
            where: {
                id
            }
        }))){
            throw new NotFoundException(`O usuário com id ${id} não existe.`);
        }
    }

}