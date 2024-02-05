import { CanActivate,ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";
//import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{

    constructor(private readonly authService: AuthService, private readonly userService: UserService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{

        const request = context.switchToHttp().getRequest();
        const {authorization} = request.headers;

        try{
            const data = this.authService.verifyToken((authorization ?? '').split(' ')[1]);

            request.tokenPayload = data;

            request.user = await this.userService.show(data.id);

            return true;
        } 
        catch(excepetion) {
            return false;
        }

    }

}