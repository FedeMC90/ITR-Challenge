import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class VariationItemDto {
  @IsString()
  @IsNotEmpty()
  public colorName: string;

  @IsString()
  @IsNotEmpty()
  public sizeCode: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  public imageUrls?: string[];

  @IsNumber()
  @IsOptional()
  public price?: number;
}

export class CreateVariationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariationItemDto)
  public variations: VariationItemDto[];

  @IsNumber()
  @IsNotEmpty()
  public basePrice: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public currencyCode?: string; // Default: 'USD'

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public countryCode?: string; // Default: 'US'
}

export class SetVariationPriceDto {
  @IsNumber()
  @IsNotEmpty()
  public price: number;

  @IsString()
  @IsNotEmpty()
  public currencyCode: string;

  @IsString()
  @IsNotEmpty()
  public countryCode: string;
}
