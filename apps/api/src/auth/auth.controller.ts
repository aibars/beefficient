import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  ConflictException,
  HttpCode,
  Res,
  Req,
  UnauthorizedException,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { FarmsService } from 'src/farms/farms.service';
import { CreateFarmDto } from 'src/farms/dto/create-farm.dto';
import { JoinFarmDto } from 'src/farms/dto/join-farm.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private farmsService: FarmsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signup(
      signUpDto.email,
      signUpDto.password,
    );

    // Set refreshToken cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ login: { limit: 10, ttl: 300000 } })
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Set refreshToken cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new BadRequestException('refreshToken required');
    }

    try {
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret: this.configService.get('auth.jwtRefreshSecret'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // VERSION CHECK: Verify token version matches latest (CRITICAL)
      const currentVersion = await this.usersService.getRefreshTokenVersion(
        payload.sub,
      );

      if (payload.version !== currentVersion) {
        throw new UnauthorizedException(
          'Refresh token is invalid or has been rotated',
        );
      }

      // Generate new tokens with incremented version
      const tokens = await this.authService.refreshTokens(
        payload.sub,
        currentVersion,
      );

      // Increment the version in the database after issuing new tokens
      await this.usersService.incrementRefreshTokenVersion(payload.sub);

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Clear refreshToken cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('google/callback')
  @HttpCode(200)
  async googleCallback(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!idToken) {
      throw new BadRequestException('idToken required');
    }

    try {
      // Verify id_token with Google
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(
        this.configService.get('GOOGLE_CLIENT_ID'),
      );
      const ticket = await client.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      const userId = payload.sub;
      const email = payload.email;

      // Find or create user
      let user = await this.usersService.findByGoogleId(userId);

      if (!user) {
        // Try to find by email
        user = await this.usersService.findByEmail(email);

        if (user && !user.googleId) {
          // Link existing email to Google ID
          await this.usersService.updateGoogleId(user.id, userId);
        } else if (!user) {
          // Create new user (and its Company) with Google ID
          user = await this.authService.registerUser(email, undefined, userId);
        }
      }

      // Update last login
      await this.usersService.updateLastLogin(user.id);

      const result = await this.authService.buildAuthResponse(user);

      response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        'OAuth verification failed: ' + errorMessage,
      );
    }
  }

  @Post('farm/create')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createFarm(
    @Body() createFarmDto: CreateFarmDto,
    @CurrentUser() user: User,
  ) {
    return this.farmsService.createFarm(
      createFarmDto.farm_name,
      createFarmDto.provincia,
      user.id,
    );
  }

  @Post('farm/join')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async joinFarm(
    @Body() joinFarmDto: JoinFarmDto,
    @CurrentUser() user: User,
  ) {
    return this.farmsService.joinFarm(joinFarmDto.join_code, user.id);
  }

  @Get('farms')
  @UseGuards(JwtAuthGuard)
  async listFarms(@CurrentUser() user: User) {
    const farms = await this.farmsService.listFarmsByUserId(user.id);
    return { farms };
  }

  @Patch('farm/:farm_id/active')
  @UseGuards(JwtAuthGuard)
  async setActiveFarm(
    @Param('farm_id') farmId: string,
    @CurrentUser() user: User,
  ) {
    return this.farmsService.setActiveFarm(farmId, user.id);
  }

  @Post('farm/:farm_id/join-code')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async generateJoinCode(
    @Param('farm_id') farmId: string,
    @CurrentUser() user: User,
  ) {
    return this.farmsService.generateJoinCode(farmId, user.id);
  }
}
