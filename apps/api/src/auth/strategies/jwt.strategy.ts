import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    // Verify that the token type is 'access', not 'refresh'
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate the user exists
    const user = await this.authService.validateJwtUser(payload);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
