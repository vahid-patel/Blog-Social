import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document

export enum UserRole {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN'
}

@Schema({timestamps:true})
export class User{
    @Prop({type:String, required : true})
    name!: string

    @Prop({type : String, required : true, unique : true})
    email! : string

    @Prop({type : String, required : true})
    password! : string

    @Prop({type : String, required : true, enum : UserRole, default : UserRole.USER })
    role! : string

    @Prop({default:false})
    verified!:boolean

    @Prop()
    otp!:string

    @Prop()
    otpExpires! : Date

}

export const UserSchema = SchemaFactory.createForClass(User)