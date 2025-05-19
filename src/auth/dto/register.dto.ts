import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    username: string;

    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}
