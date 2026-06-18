import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class passUpdateDto {
  @IsString()
  @IsNotEmpty()
  readonly password!: string;

  @IsEmail()
  @IsNotEmpty()
  readonly newpassword!: string;
}
