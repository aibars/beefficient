import { ConflictException } from '@nestjs/common';
import { EstablecimientoActivoService } from './establecimiento-activo.service';
import { UserFarmRepository } from '../farms/user-farm.repository';
import { User } from '../users/users.entity';

describe('EstablecimientoActivoService', () => {
  let findByUserAndFarm: jest.Mock;
  let service: EstablecimientoActivoService;

  const usuario = (activeFarmId: string | null): User =>
    ({ id: 'user-1', activeFarmId }) as User;

  beforeEach(() => {
    findByUserAndFarm = jest.fn();
    service = new EstablecimientoActivoService({
      findByUserAndFarm,
    } as unknown as UserFarmRepository);
  });

  it('devuelve el id del establecimiento activo cuando hay membresía', async () => {
    findByUserAndFarm.mockResolvedValue({ id: 'uf-1' });

    await expect(service.resolver(usuario('farm-1'))).resolves.toBe('farm-1');
    expect(findByUserAndFarm).toHaveBeenCalledWith('user-1', 'farm-1');
  });

  it('lanza 409 si el usuario no tiene establecimiento activo', async () => {
    const promesa = service.resolver(usuario(null));

    await expect(promesa).rejects.toBeInstanceOf(ConflictException);
    await expect(promesa).rejects.toThrow('No tenés un establecimiento activo.');
    expect(findByUserAndFarm).not.toHaveBeenCalled();
  });

  it('lanza 409 si tiene establecimiento activo pero sin membresía', async () => {
    findByUserAndFarm.mockResolvedValue(null);

    const promesa = service.resolver(usuario('farm-1'));

    await expect(promesa).rejects.toBeInstanceOf(ConflictException);
    await expect(promesa).rejects.toThrow('No tenés un establecimiento activo.');
  });
});
