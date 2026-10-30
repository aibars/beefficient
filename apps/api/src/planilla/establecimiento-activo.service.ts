import { ConflictException, Injectable } from '@nestjs/common';
import { UserFarmRepository } from '../farms/user-farm.repository';
import { User } from '../users/users.entity';

@Injectable()
export class EstablecimientoActivoService {
  constructor(private readonly userFarmRepository: UserFarmRepository) {}

  async resolver(user: User): Promise<string> {
    const farmId = user.activeFarmId;
    if (!farmId) {
      throw new ConflictException('No tenés un establecimiento activo.');
    }
    const membresia = await this.userFarmRepository.findByUserAndFarm(
      user.id,
      farmId,
    );
    if (!membresia) {
      throw new ConflictException('No tenés un establecimiento activo.');
    }
    return farmId;
  }
}
