import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateUserDTO } from "./DTO/create-user.dto";
import { UpdatePutUserDTO } from "./DTO/update-put-user.dto";
import { UpdatePatchUserDTO } from "./DTO/update-patch-user.dto";
import { UserService } from "./user.service";
import { LogInterceptor } from "src/interceptors/log.interceptor";
import { ParamId } from "src/decorators/param-id-decorator";
import { Roles } from "src/decorators/role-decorator";
import { Role } from "src/enums/role.enum";
import { RoleGuard } from "src/guards/role.guard";
import { AuthGuard } from "src/guards/auth.guard";
//import { ThrottlerGuard } from "@nestjs/throttler";

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller('users')
export class UserController{
    
    constructor(private userService: UserService){}

    @Get()
    async read(){
        return this.userService.list();
    }

    @Get(':id')
    async readOne(@ParamId() id: number){
        console.log(id)
        return this.userService.show(id);
    }

    //@UseInterceptors(LogInterceptor)
    @Post()
    async createUser(@Body() body: CreateUserDTO){
        return this.userService.createUser(body);
    }

    @Put(':id')
    async update(@Body() body: UpdatePutUserDTO, @Param('id', ParseIntPipe) id: number){
        return this.userService.update(body, id);
    }

    @Patch(':id')
    async updatePartial(@Body() body: UpdatePatchUserDTO, @Param('id', ParseIntPipe) id: number){
        return this.userService.updatePartial(body, id)
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return this.userService.delete(id);
    }
}