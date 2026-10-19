import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { EntityManager } from 'typeorm';
import { isUniqueViolation } from '../common/database/pg-errors';
import { FarmJoinCode } from './farm-join-code.entity';
import { FarmJoinCodeRepository } from './farm-join-code.repository';

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const MIN_LENGTH = 8;
const MAX_LENGTH = 12;
// Largest multiple of ALPHABET.length below 256; bytes >= this are rejected to avoid modulo bias.
const UNBIASED_LIMIT = 256 - (256 % ALPHABET.length);
const MAX_GENERATION_ATTEMPTS = 10;

export const INVALID_JOIN_CODE_MESSAGE = 'Invalid or used join code';

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

  /** Read-only lookup: the code if it exists and has not been redeemed. */
  async findRedeemable(code: string): Promise<FarmJoinCode | null> {
    return this.joinCodeRepository.findUnusedByCode(code);
  }

  /**
   * Redeems a join code for `userId` and returns its farm. The check and the
   * mark-as-used are one conditional UPDATE, so a code can be redeemed once
   * even under concurrent requests. Pass `manager` to run inside a caller's
   * transaction (the redemption then rolls back with it).
   */
  async validateAndMarkUsed(
    code: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<{ farmId: string }> {
    const farmId = await this.joinCodeRepository.redeem(code, userId, manager);
    if (!farmId) {
      throw new BadRequestException(INVALID_JOIN_CODE_MESSAGE);
    }
    return { farmId };
  }

  /**
   * Generates and stores a new code for the farm. Uniqueness is enforced by
   * the `uk_farm_join_codes_code` constraint: a colliding insert (including
   * one racing a concurrent request) is retried with a fresh code, instead of
   * a check-then-insert that two requests could both pass.
   */
  async generateAndCreate(farmId: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const code = this.generateCode();
      try {
        await this.joinCodeRepository.createJoinCode(farmId, code);
        return code;
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
    }
    throw new Error('Unable to generate a unique join code');
  }
}
