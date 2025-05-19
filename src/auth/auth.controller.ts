import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, ValidationPipe, UsePipes, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  register(@Body() regiserDto: RegisterDto) {
    return this.authService.register(regiserDto);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('me')
  me(@Req() req: Request) {
    const token = req.cookies[this.configService.get<string>('JWT_TOKEN_KEY', 'jwt_token')];
    if (!token) {
      throw new UnauthorizedException('Access denied');
    }
    return this.authService.getMeData(req.cookies[this.configService.get<string>('JWT_TOKEN_KEY', 'jwt_token')]);
  }
}
