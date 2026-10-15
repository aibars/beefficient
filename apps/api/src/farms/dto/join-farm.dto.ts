import { IsString, IsNotEmpty, Length } from 'class-validator';

export class JoinFarmDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 12)
  join_code: string;
}
