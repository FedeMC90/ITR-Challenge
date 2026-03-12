import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { ProductVariationPrice } from 'src/database/entities/productVariation_price.entity';
import { Color } from 'src/database/entities/color.entity';
import { Size } from 'src/database/entities/size.entity';
import { Currency } from 'src/database/entities/currency.entity';
import { Country } from 'src/database/entities/country.entity';
import {
  CreateVariationsDto,
  SetVariationPriceDto,
} from '../dto/product-variation.dto';

const errorMessages = {
  product: {
    notFound: 'Product not found',
  },
  variation: {
    notFound: 'Product variation not found',
  },
  color: {
    notFound: 'Color not found',
  },
  size: {
    notFound: 'Size not found',
  },
  currency: {
    notFound: 'Currency not found',
  },
  country: {
    notFound: 'Country not found',
  },
};

@Injectable()
export class ProductVariationService {
  constructor(private readonly entityManager: EntityManager) {}

  async createVariations(
    productId: number,
    data: CreateVariationsDto,
    merchantId: number,
  ) {
    // Verify product exists and belongs to merchant
    const product = await this.entityManager.findOne(Product, {
      where: { id: productId, merchantId },
    });

    if (!product) throw new NotFoundException(errorMessages.product.notFound);

    const currencyCode = data.currencyCode || 'USD';
    const countryCode = data.countryCode || 'US';

    // Verify currency and country exist
    const currency = await this.entityManager.findOne(Currency, {
      where: { code: currencyCode },
    });
    if (!currency) throw new NotFoundException(errorMessages.currency.notFound);

    const country = await this.entityManager.findOne(Country, {
      where: { code: countryCode },
    });
    if (!country) throw new NotFoundException(errorMessages.country.notFound);

    const createdVariations = [];

    for (const variationData of data.variations) {
      // Verify color exists
      const color = await this.entityManager.findOne(Color, {
        where: { name: variationData.colorName },
      });
      if (!color) throw new NotFoundException(errorMessages.color.notFound);

      // Verify size exists
      const size = await this.entityManager.findOne(Size, {
        where: { code: variationData.sizeCode },
      });
      if (!size) throw new NotFoundException(errorMessages.size.notFound);

      // Create variation
      const variation = this.entityManager.create(ProductVariation, {
        productId,
        colorName: variationData.colorName,
        sizeCode: variationData.sizeCode,
        imageUrls: variationData.imageUrls || [],
      });

      const savedVariation = await this.entityManager.save(variation);

      // Use individual variation price if provided, otherwise use basePrice
      const variationPrice = variationData.price ?? data.basePrice;

      // Create price for this variation
      const price = this.entityManager.create(ProductVariationPrice, {
        productVariationId: savedVariation.id,
        currencyCode,
        countryCode,
        price: variationPrice,
      });

      await this.entityManager.save(price);

      createdVariations.push({
        ...savedVariation,
        price: variationPrice,
        currencyCode,
        countryCode,
      });
    }

    return createdVariations;
  }

  async getProductVariations(productId: number) {
    const variations = await this.entityManager.find(ProductVariation, {
      where: { productId },
      relations: ['color', 'size'],
    });

    // Get prices for each variation
    const variationsWithPrices = await Promise.all(
      variations.map(async (variation) => {
        const prices = await this.entityManager.find(ProductVariationPrice, {
          where: { productVariationId: variation.id },
          relations: ['currency', 'country'],
        });

        return {
          ...variation,
          prices,
        };
      }),
    );

    return variationsWithPrices;
  }

  async setVariationPrice(
    variationId: number,
    data: SetVariationPriceDto,
    merchantId: number,
  ) {
    // Verify variation exists and product belongs to merchant
    const variation = await this.entityManager.findOne(ProductVariation, {
      where: { id: variationId },
      relations: ['product'],
    });

    if (!variation || variation.product.merchantId !== merchantId) {
      throw new NotFoundException(errorMessages.variation.notFound);
    }

    // Verify currency and country exist
    const currency = await this.entityManager.findOne(Currency, {
      where: { code: data.currencyCode },
    });
    if (!currency) throw new NotFoundException(errorMessages.currency.notFound);

    const country = await this.entityManager.findOne(Country, {
      where: { code: data.countryCode },
    });
    if (!country) throw new NotFoundException(errorMessages.country.notFound);

    // Check if price already exists for this variation/currency/country
    let price = await this.entityManager.findOne(ProductVariationPrice, {
      where: {
        productVariationId: variationId,
        currencyCode: data.currencyCode,
        countryCode: data.countryCode,
      },
    });

    if (price) {
      // Update existing price
      price.price = data.price;
      await this.entityManager.save(price);
    } else {
      // Create new price
      price = this.entityManager.create(ProductVariationPrice, {
        productVariationId: variationId,
        currencyCode: data.currencyCode,
        countryCode: data.countryCode,
        price: data.price,
      });
      await this.entityManager.save(price);
    }

    return price;
  }
}
