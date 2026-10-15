import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  farm_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  provincia: string;
}
