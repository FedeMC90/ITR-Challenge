import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from 'src/config';
import { Category } from 'src/database/entities/category.entity';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { Product } from 'src/database/entities/product.entity';
import { TypeOrmConfigService } from 'src/database/typeorm/typeorm.service';
import { Color } from '../entities/color.entity';
import { Country } from '../entities/country.entity';
import { Currency } from '../entities/currency.entity';
import { Size } from '../entities/size.entity';
import { ProductVariation } from '../entities/productVariation.entity';
import { ProductVariationPrice } from '../entities/productVariation_price.entity';
import { SeedService } from './seed.service';
import { AdminSeeder } from './seeders/admin.seeder';
import { CategorySeeder } from './seeders/category.seeder';
import { ColorSeeder } from './seeders/color.seeder';
import { CountrySeeder } from './seeders/country.seeder';
import { CurrencySeeder } from './seeders/currency.seeder';
import { RolesSeeder } from './seeders/role.seeder';
import { SizeSeeder } from './seeders/size.seeder';
import { ProductSeeder } from './seeders/product.seeder';
import { ProductVariationSeeder } from './seeders/product-variation.seeder';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    TypeOrmModule.forFeature([
      Role,
      User,
      Category,
      Size,
      Color,
      Country,
      Currency,
      Product,
      ProductVariation,
      ProductVariationPrice,
    ]),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
  ],
  controllers: [],
  providers: [
    SeedService,
    RolesSeeder,
    AdminSeeder,
    CategorySeeder,
    SizeSeeder,
    ColorSeeder,
    CountrySeeder,
    CurrencySeeder,
    ProductSeeder,
    ProductVariationSeeder,
  ],
})
export class SeedModule {}
