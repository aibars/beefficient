import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
  version?: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly jwtAccessExpiration: number;
  private readonly jwtRefreshExpiration: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.bcryptRounds = this.configService.get('auth.bcryptRounds') || 10;
    this.jwtAccessExpiration =
      this.configService.get('auth.jwtAccessExpiration') || 900;
    this.jwtRefreshExpiration =
      this.configService.get('auth.jwtRefreshExpiration') || 604800;
  }

  async signup(
    email: string,
    password: string,
  ): Promise<AuthResponseDto> {
    // Hash password
    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

    // Create user (will throw ConflictException if email exists)
    const user = await this.usersService.create(email, passwordHash);

    // Update lastLoginAt
    await this.usersService.updateLastLogin(user.id);

    // Generate and return tokens
    const tokens = await this.generateTokens(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    // Validate credentials
    const user = await this.validateLocalUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update lastLoginAt
    await this.usersService.updateLastLogin(user.id);

    // Generate and return tokens
    const tokens = await this.generateTokens(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async validateLocalUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    // Check if user has passwordHash (OAuth users don't)
    if (!user.passwordHash) {
      return null;
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateJwtUser(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }

  async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: JwtPayload = {
      sub: userId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      type: 'refresh',
      version: 1,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('auth.jwtAccessSecret'),
      expiresIn: this.jwtAccessExpiration,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('auth.jwtRefreshSecret'),
      expiresIn: this.jwtRefreshExpiration,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    userId: string,
    currentVersion: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Create new access token with same userId
    const accessPayload: JwtPayload = {
      sub: userId,
      type: 'access',
    };

    // Create new refresh token with incremented version (rotation)
    const refreshPayload: JwtPayload = {
      sub: userId,
      type: 'refresh',
      version: currentVersion + 1,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('auth.jwtAccessSecret'),
      expiresIn: this.jwtAccessExpiration,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('auth.jwtRefreshSecret'),
      expiresIn: this.jwtRefreshExpiration,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
