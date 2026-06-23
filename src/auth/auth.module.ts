import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryService } from './user/users.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('SIGNATURE') ||
          'ZAMRA_DEFAULT_BACKUP_SECRET',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController, UserRepositoryService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
