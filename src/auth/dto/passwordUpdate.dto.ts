import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { AUTH_MESSAGES } from '../../common/constants/messages.constant';

export class PassUpdateDto {
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.VALIDATION.OLD_PASSWORD_EMPTY })
  readonly password!: string;

  @IsString()
  @MinLength(8, { message: AUTH_MESSAGES.VALIDATION.NEW_PASSWORD_SHORT })
  @IsNotEmpty({ message: AUTH_MESSAGES.VALIDATION.NEW_PASSWORD_EMPTY })
  readonly newpassword!: string;
}
