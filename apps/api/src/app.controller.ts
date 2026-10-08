import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { User } from './users/users.entity';

/**
 * Example controller demonstrating global middleware and protected routes.
 *
 * - Global ValidationPipe validates all incoming DTOs
 * - CORS is configured globally in main.ts
 * - Protected routes use @UseGuards(JwtAuthGuard) + @CurrentUser()
 */
@Controller()
export class AppController {
  /**
   * Health check endpoint (public).
   * Tests that the global middleware (CORS, ValidationPipe) is working.
   */
  @Get('/health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Protected profile endpoint.
   * Example of @UseGuards(JwtAuthGuard) + @CurrentUser() decorator.
   * Only accessible with a valid JWT token in Authorization header.
   *
   * Usage:
   *   GET /profile
   *   Authorization: Bearer <access_token>
   *
   * Response: { id, email, createdAt }
   */
  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
