import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { TokenService } from './token.service';
import { CryptoService } from 'src/common/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    const isUserExist = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });

    if (isUserExist) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    const user = await this.userRepository.save(newUser);
    return {
      message: 'User registered successfully',
      ...user
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = await this.tokenService.generateToken(user);
    const hashedToken = this.cryptoService.encrypt(token.access_token);
    const ms = require('ms');

    res.cookie(this.configService.get<string>('JWT_TOKEN_KEY', 'jwt_token'), hashedToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: ms(this.configService.get<string>('JWT_EXPIRATION') || '1d'),
      path: '/',
    });

    return {
      message: 'Login successful',
      ...userWithoutPassword
    }
  }

  async getMeData(token: string) {
    const decryptedToken = this.cryptoService.decrypt(token);
    const isTokenValid = this.tokenService.verifyToken(decryptedToken);
    const decodedToken = await this.tokenService.decodeToken(decryptedToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.findOne({
      where: { id: decodedToken.sub },
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'User data retrieved successfully',
      user: userWithoutPassword
    }
  }
}
