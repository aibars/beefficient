import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(
    email: string,
    manager?: EntityManager,
  ): Promise<User | null> {
    const repo = manager ? manager.getRepository(User) : this;
    return repo.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({ where: { googleId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(
    email: string,
    passwordHash?: string,
    googleId?: string,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this;
    const user = repo.create({
      email,
      passwordHash,
      googleId,
    });
    return repo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { lastLoginAt: new Date() });
  }

  async updateGoogleId(id: string, googleId: string): Promise<void> {
    await this.update(id, { googleId });
  }

  async getRefreshTokenVersion(id: string): Promise<number> {
    const user = await this.findById(id);
    return user?.refreshTokenVersion || 1;
  }

  async incrementRefreshTokenVersion(id: string): Promise<number> {
    const user = await this.findById(id);
    const newVersion = (user?.refreshTokenVersion || 1) + 1;
    await this.update(id, { refreshTokenVersion: newVersion });
    return newVersion;
  }
}
