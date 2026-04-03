import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class UpdateUserDto{
    @IsNotEmpty()
    @IsString()
    name!:string

    @IsNotEmpty()
    @IsStrongPassword()
    prevPassword!:string

    @IsNotEmpty()
    @IsStrongPassword()
    newPassword!:string
}