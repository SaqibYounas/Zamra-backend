import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { AUTH_MESSAGES } from '../../common/constants/messages.constant';

export class SignInDto {
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.VALIDATION.NAME_EMPTY })
  readonly name!: string;

  @IsEmail({}, { message: AUTH_MESSAGES.VALIDATION.EMAIL_INVALID })
  @IsNotEmpty({ message: AUTH_MESSAGES.VALIDATION.EMAIL_EMPTY })
  readonly email!: string;

  @IsString()
  @MinLength(8, { message: AUTH_MESSAGES.VALIDATION.PASSWORD_SHORT })
  @IsNotEmpty({ message: AUTH_MESSAGES.VALIDATION.PASSWORD_EMPTY })
  readonly password!: string;
}
