import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  @IsNotEmpty()
  public userId: number;

  @IsNumber()
  @IsNotEmpty()
  public roleId: number;
}

export class RoleDto {
  @Expose()
  public id: number;

  @Expose()
  public name: string;
}
