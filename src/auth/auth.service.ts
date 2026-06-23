import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AUTH_MESSAGES } from '../common/constants/messages.constant';
import { UserRepositoryService } from './user/users.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserRepositoryService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: { id: number; name: string; email: string };
  }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.ERROR.EMAIL_INCORRECT);
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException(AUTH_MESSAGES.ERROR.PASSWORD_INCORRECT);
    }

    const payload = { sub: user.id, name: user.name, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async changePassword(user: any, password: any, newPassword: any) {
    if (!password || !newPassword) {
      throw new BadRequestException(AUTH_MESSAGES.ERROR.MISSING_FIELDS);
    }

    const userDB = await this.usersService.findOneByEmail(user.email);
    if (!userDB) {
      throw new NotFoundException(AUTH_MESSAGES.ERROR.USER_NOT_FOUND);
    }

    const isPasswordMatching = await bcrypt.compare(password, userDB.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException(AUTH_MESSAGES.ERROR.PASSWORD_INCORRECT);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    this.usersService.update(userDB.id, {
      password: hashedNewPassword,
    });

    return {
      message: AUTH_MESSAGES.SUCCESS.PASSWORD_UPDATED,
    };
  }
}
