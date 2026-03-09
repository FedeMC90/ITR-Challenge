import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
