import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { UserRole } from "../../users/UserSchema/User.schema"


export class SignupDto{
    @IsNotEmpty()
    @IsString()
    name!:string

    @IsNotEmpty()
    @IsEmail()
    email!:string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password!:string

   

}

export class VerifyOtpDto{
    @IsNotEmpty()
    @IsEmail()
    email!:string

    @IsNotEmpty()
    otp!:string
}