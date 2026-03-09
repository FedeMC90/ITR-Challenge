import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * Reusable DTO for pagination query parameters
 * Can be used across different modules (products, users, orders, etc.)
 */
export class PaginationQueryDto {
  // Page number - Optional, defaults to 1, must be at least 1
  @IsOptional()
  @Type(() => Number) // Transform string query param to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Items per page - Optional, defaults to 10, max 100 to prevent performance issues
  @IsOptional()
  @Type(() => Number) // Transform string query param to number
  @IsInt()
  @Min(1)
  @Max(100) // Prevent clients from requesting too many items at once
  limit?: number = 10;
}
