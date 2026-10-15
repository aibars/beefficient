import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id: googleId, email } = profile;

    try {
      // Try to find user by googleId
      let user = await this.usersService.findByGoogleId(googleId);

      if (user) {
        return done(null, user);
      }

      // Try to find user by email
      user = await this.usersService.findByEmail(email);

      if (user) {
        // If user exists with this email but no googleId, link them (optional in MVP)
        // For now, just return the existing user
        return done(null, user);
      }

      // Create new user with googleId and email
      user = await this.usersService.create(email, undefined, googleId);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
}
