import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class LoginDto{
    @IsNotEmpty()
    @IsEmail()
    email!:string

    @IsNotEmpty()
    password!:string

}

export class ForgotPassDto{
    @IsNotEmpty()
    @IsEmail()
    email!:string
}

export class ResetPassDto{
    @IsNotEmpty()
    @IsString()
    userId!:string

    @IsNotEmpty()
    @IsString()
    token! : string

    @IsNotEmpty()
    @IsStrongPassword()
    newPassword!:string
}