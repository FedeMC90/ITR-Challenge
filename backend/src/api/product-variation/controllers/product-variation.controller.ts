import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoleIds } from '../../role/enum/role.enum';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { FindOneParams } from 'src/common/helper/findOneParams.dto';
import { CurrentUser } from 'src/api/auth/guards/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { ProductVariationService } from '../services/product-variation.service';
import {
  CreateVariationsDto,
  SetVariationPriceDto,
} from '../dto/product-variation.dto';

@Controller('product')
export class ProductVariationController {
  constructor(
    private readonly productVariationService: ProductVariationService,
  ) {}

  /**
   * Create variations (color + size combinations) for a product
   * POST /api/product/:id/variations
   */
  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Post(':id/variations')
  async createVariations(
    @Param() params: FindOneParams,
    @Body() body: CreateVariationsDto,
    @CurrentUser() user: User,
  ) {
    return this.productVariationService.createVariations(
      params.id,
      body,
      user.id,
    );
  }

  /**
   * Get all variations for a product with their prices
   * GET /api/product/:id/variations
   */
  @Get(':id/variations')
  async getProductVariations(@Param() params: FindOneParams) {
    return this.productVariationService.getProductVariations(params.id);
  }

  /**
   * Set/update price for a specific variation
   * POST /api/product/variation/:id/price
   */
  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Post('variation/:id/price')
  async setVariationPrice(
    @Param() params: FindOneParams,
    @Body() body: SetVariationPriceDto,
    @CurrentUser() user: User,
  ) {
    return this.productVariationService.setVariationPrice(
      params.id,
      body,
      user.id,
    );
  }
}
