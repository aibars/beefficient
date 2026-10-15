export class FarmResponseDto {
  farm_id: string;
  farm_name: string;
  provincia: string;
  role: 'admin' | 'tecnico';
  active: boolean;
}
