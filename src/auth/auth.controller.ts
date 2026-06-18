/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post, HttpCode, HttpStatus,UseGuards,Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

@UseGuards(AuthGuard)
  @Post('update')
  updatePassword(@Request() req: any, @Body() passUpdateDto: Record<string, any>) {
    return this.authService.changePassword(
      req.user, 
      passUpdateDto.password, 
      passUpdateDto.newpassword
    );  
}
}