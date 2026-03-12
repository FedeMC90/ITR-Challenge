import { IsNotEmpty, IsString } from 'class-validator';
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
  @IsNotEmpty()
  season: string; // e.g., "Spring/Summer 2026", "Fall/Winter 2025"
}
