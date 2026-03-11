import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { Product, VariationTypes } from 'src/database/entities/product.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { ProductVariationPrice } from 'src/database/entities/productVariation_price.entity';
import { Color } from 'src/database/entities/color.entity';
import { Size } from 'src/database/entities/size.entity';
import { Currency } from 'src/database/entities/currency.entity';
import { Country } from 'src/database/entities/country.entity';

@Injectable()
export class ProductVariationSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariation)
    private readonly productVariationRepository: Repository<ProductVariation>,
    @InjectRepository(ProductVariationPrice)
    private readonly productVariationPriceRepository: Repository<ProductVariationPrice>,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async seed() {
    const products = await this.productRepository.find();
    const colors = await this.colorRepository.find();
    const sizes = await this.sizeRepository.find();
    const currencies = await this.currencyRepository.find();
    const countries = await this.countryRepository.find();

    // Helper functions to find entities
    const findColor = (name: string) =>
      colors.find((c) => c.name === name) || colors[0];
    const findSize = (code: string) =>
      sizes.find((s) => s.code === code) || sizes[0];
    const findCurrency = (code: string) =>
      currencies.find((c) => c.code === code) || currencies[0];
    const findCountry = (code: string) =>
      countries.find((c) => c.code === code) || countries[0];

    // Product variation configurations
    const variationConfigs = {
      'LAPTOP-001': {
        basePrice: 1299.99,
        variations: [
          { colorName: 'black', sizeCode: 'NA' },
          { colorName: 'silver', sizeCode: 'NA' },
          { colorName: 'white', sizeCode: 'NA' },
        ],
      },
      'TSHIRT-001': {
        basePrice: 29.99,
        variations: [
          { colorName: 'black', sizeCode: 'S' },
          { colorName: 'black', sizeCode: 'M' },
          { colorName: 'black', sizeCode: 'L' },
          { colorName: 'black', sizeCode: 'XL' },
          { colorName: 'white', sizeCode: 'S' },
          { colorName: 'white', sizeCode: 'M' },
          { colorName: 'white', sizeCode: 'L' },
          { colorName: 'white', sizeCode: 'XL' },
          { colorName: 'red', sizeCode: 'S' },
          { colorName: 'red', sizeCode: 'M' },
          { colorName: 'red', sizeCode: 'L' },
          { colorName: 'red', sizeCode: 'XL' },
          { colorName: 'blue', sizeCode: 'S' },
          { colorName: 'blue', sizeCode: 'M' },
          { colorName: 'blue', sizeCode: 'L' },
          { colorName: 'blue', sizeCode: 'XL' },
        ],
      },
      'MOUSE-001': {
        basePrice: 79.99,
        variations: [
          { colorName: 'black', sizeCode: 'NA' },
          { colorName: 'red', sizeCode: 'NA' },
          { colorName: 'white', sizeCode: 'NA' },
        ],
      },
      'JEANS-001': {
        basePrice: 89.99,
        variations: [
          { colorName: 'blue', sizeCode: '28' },
          { colorName: 'blue', sizeCode: '30' },
          { colorName: 'blue', sizeCode: '32' },
          { colorName: 'blue', sizeCode: '34' },
          { colorName: 'blue', sizeCode: '36' },
          { colorName: 'black', sizeCode: '28' },
          { colorName: 'black', sizeCode: '30' },
          { colorName: 'black', sizeCode: '32' },
          { colorName: 'black', sizeCode: '34' },
          { colorName: 'black', sizeCode: '36' },
        ],
      },
      'JACKET-001': {
        basePrice: 249.99,
        variations: [
          { colorName: 'NA', sizeCode: 'S' },
          { colorName: 'NA', sizeCode: 'M' },
          { colorName: 'NA', sizeCode: 'L' },
          { colorName: 'NA', sizeCode: 'XL' },
          { colorName: 'NA', sizeCode: 'XXL' },
        ],
      },
    };

    for (const product of products) {
      const config = variationConfigs[product.code];
      if (!config) continue;

      console.log(`\n🔄 Processing variations for ${product.code}...`);

      for (const varConfig of config.variations) {
        // Check if variation already exists
        const existingVariation = await this.productVariationRepository.findOne(
          {
            where: {
              productId: product.id,
              colorName: varConfig.colorName,
              sizeCode: varConfig.sizeCode,
            },
          },
        );

        if (existingVariation) {
          console.log(
            `  ℹ️  Variation already exists: ${varConfig.colorName}/${varConfig.sizeCode}`,
          );
          continue;
        }

        // Create variation
        const variation = this.productVariationRepository.create({
          product: product,
          colorName: varConfig.colorName,
          sizeCode: varConfig.sizeCode,
          imageUrls: [],
        });

        const savedVariation = await this.productVariationRepository.save(
          variation,
        );
        console.log(
          `  ✅ Created variation: ${varConfig.colorName}/${varConfig.sizeCode}`,
        );

        // Create prices for different countries and currencies
        const priceConfigs = [
          { currencyCode: 'USD', countryCode: 'US', multiplier: 1 },
          { currencyCode: 'EUR', countryCode: 'ES', multiplier: 0.92 },
          { currencyCode: 'ARS', countryCode: 'AR', multiplier: 350 },
        ];

        for (const priceConfig of priceConfigs) {
          // Check if price already exists
          const existingPrice =
            await this.productVariationPriceRepository.findOne({
              where: {
                productVariationId: savedVariation.id,
                currencyCode: priceConfig.currencyCode,
                countryCode: priceConfig.countryCode,
              },
            });

          if (existingPrice) {
            continue;
          }

          const price = this.productVariationPriceRepository.create({
            productVariation: savedVariation,
            price: parseFloat(
              (config.basePrice * priceConfig.multiplier).toFixed(2),
            ),
            currencyCode: priceConfig.currencyCode,
            countryCode: priceConfig.countryCode,
          });

          await this.productVariationPriceRepository.save(price);
        }

        console.log(`    💰 Created prices for ${priceConfigs.length} markets`);
      }

      console.log(
        `✅ Completed ${config.variations.length} variations for ${product.code}`,
      );
    }
  }
}
