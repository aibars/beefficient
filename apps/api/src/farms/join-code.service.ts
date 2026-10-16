import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { FarmJoinCodeRepository } from './farm-join-code.repository';

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const MIN_LENGTH = 8;
const MAX_LENGTH = 12;
// Largest multiple of ALPHABET.length below 256; bytes >= this are rejected to avoid modulo bias.
const UNBIASED_LIMIT = 256 - (256 % ALPHABET.length);
const MAX_GENERATION_ATTEMPTS = 10;

@Injectable()
export class JoinCodeService {
  constructor(private readonly joinCodeRepository: FarmJoinCodeRepository) {}

  /** Cryptographically secure 8-12 char alphanumeric code. */
  generateCode(): string {
    const length =
      MIN_LENGTH + (randomBytes(1)[0] % (MAX_LENGTH - MIN_LENGTH + 1));
    let code = '';
    while (code.length < length) {
      const bytes = randomBytes(length * 2);
      for (let i = 0; i < bytes.length && code.length < length; i++) {
        if (bytes[i] < UNBIASED_LIMIT) {
          code += ALPHABET[bytes[i] % ALPHABET.length];
        }
      }
    }
    return code;
  }

  async validateAndMarkUsed(
    code: string,
    userId: string,
  ): Promise<{ farmId: string }> {
    const joinCode = await this.joinCodeRepository.findByCode(code);
    if (!joinCode || joinCode.usedById !== null) {
      throw new Error('InvalidJoinCode');
    }
    await this.joinCodeRepository.markAsUsed(joinCode.id, userId);
    return { farmId: joinCode.farmId };
  }

  async generateAndCreate(farmId: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const code = this.generateCode();
      const existing = await this.joinCodeRepository.findByCode(code);
      if (!existing) {
        await this.joinCodeRepository.createJoinCode(farmId, code);
        return code;
      }
    }
    throw new Error('Unable to generate a unique join code');
  }
}
