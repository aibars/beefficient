import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(
    email: string,
    passwordHash?: string,
    googleId?: string,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    return this.usersRepository.createUser(email, passwordHash, googleId);
  }

  async updateLastLogin(id: string): Promise<void> {
    return this.usersRepository.updateLastLogin(id);
  }
}
