import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CryptoService } from 'src/common/services/crypto.service';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    JwtModule.registerAsync(jwtConfig)
  ],
  controllers: [AuthController],
  providers: [
    CryptoService,
    AuthService,
    TokenService
  ],
})
export class AuthModule { }
