import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.name };
    JwtModule.register({
      secret: this.configService.get<string>('SIGNATURE'),
      signOptions: { expiresIn: '1d' },
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
