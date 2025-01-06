import { IsArray, IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  readonly password: string;

  @IsString()
  @MinLength(2)
  readonly fullName: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles?: string[];
}