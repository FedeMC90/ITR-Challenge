import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { ProductVariationPrice } from 'src/database/entities/productVariation_price.entity';
import { Product } from 'src/database/entities/product.entity';
import { Color } from 'src/database/entities/color.entity';
import { Size } from 'src/database/entities/size.entity';
import { Currency } from 'src/database/entities/currency.entity';
import { Country } from 'src/database/entities/country.entity';
import { ProductVariationService } from './services/product-variation.service';
import { ProductVariationController } from './controllers/product-variation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariation,
      ProductVariationPrice,
      Product,
      Color,
      Size,
      Currency,
      Country,
    ]),
    AuthModule,
  ],
  controllers: [ProductVariationController],
  providers: [ProductVariationService],
  exports: [ProductVariationService],
})
export class ProductVariationModule {}
