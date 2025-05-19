
import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateToken(user: User) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            expires_in: this.configService.get('JWT_EXPIRATION'),
        };
    }

    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async decodeToken(token: string) {
        try {
            return this.jwtService.decode(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}