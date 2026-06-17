import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class signInDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @IsString()
  @MinLength(8)
  readonly password!: string;
}
