import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { UserService } from '../models/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: { id: number; name: string; email: string };
  }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Password is incorrect!');
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
      throw new BadRequestException('Missing field');
    }

    const userDB = await this.usersService.findOneByEmail(user.email);
    if (!userDB) {
      throw new NotFoundException('User not found');
    }

    const isPasswordMatching = await bcrypt.compare(password, userDB.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await this.usersService.create({
      ...userDB,
      password: hashedNewPassword,
    });

    return {
      statusCode: 200,
      message: 'Password is Successfully update! 🎉',
    };
  }
}