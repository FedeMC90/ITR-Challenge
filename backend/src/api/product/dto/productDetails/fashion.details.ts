import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Categories } from 'src/database/entities/category.entity';

export class FashionDetails {
  @IsString()
  @IsNotEmpty()
  category = Categories.Fashion;

  @IsString()
  @IsNotEmpty()
  material: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

  @IsString()
  @IsNotEmpty()
  season: string; // e.g., "Spring/Summer 2026", "Fall/Winter 2025"
}
