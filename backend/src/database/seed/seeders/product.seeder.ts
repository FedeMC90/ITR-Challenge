import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { Product, VariationTypes } from 'src/database/entities/product.entity';
import { User } from 'src/database/entities/user.entity';
import { CategoryIds } from 'src/database/entities/category.entity';

@Injectable()
export class ProductSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    // Get admin user as merchant
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@admin.com' },
    });

    if (!adminUser) {
      console.warn('Admin user not found, skipping product seeding');
      return;
    }

    const productsData = this.generateData(adminUser.id);

    // Check if products already exist and only insert new ones
    for (const productData of productsData) {
      const existing = await this.productRepository.findOne({
        where: { code: productData.code },
      });

      if (!existing) {
        await this.productRepository.save(productData);
        console.log(`✅ Created product: ${productData.title}`);
      } else {
        console.log(`ℹ️  Product already exists: ${productData.title}`);
      }
    }
  }

  generateData(merchantId: number): Partial<Product>[] {
    return [
      // ACTIVE PRODUCTS (4)
      {
        code: 'LAPTOP-001',
        title: 'Dell XPS 15 Laptop',
        variationType: VariationTypes.OnlyColor,
        description:
          'High-performance laptop with 15.6" 4K display, Intel i7 processor, 16GB RAM, and 512GB SSD',
        about: [
          'Intel Core i7 11th Gen',
          '16GB DDR4 RAM',
          '512GB NVMe SSD',
          '15.6" 4K OLED Display',
          'NVIDIA GeForce RTX 3050',
        ],
        details: {
          category: 'Computers',
          capacity: 512,
          capacityUnit: 'GB',
          capacityType: 'SSD',
          brand: 'Dell',
          series: 'XPS 15',
        } as any,
        isActive: true,
        merchantId,
        categoryId: CategoryIds.Computers,
      },
      {
        code: 'TSHIRT-001',
        title: 'Cotton T-Shirt - Classic Fit',
        variationType: VariationTypes.SizeAndColor,
        description:
          'Premium 100% cotton t-shirt with classic fit, perfect for everyday wear',
        about: [
          '100% Premium Cotton',
          'Pre-shrunk fabric',
          'Reinforced neck seam',
          'Machine washable',
          'Available in multiple sizes and colors',
        ],
        details: null,
        isActive: true,
        merchantId,
        categoryId: CategoryIds.Fashion,
      },
      {
        code: 'MOUSE-001',
        title: 'Wireless Gaming Mouse',
        variationType: VariationTypes.OnlyColor,
        description:
          'Ergonomic wireless gaming mouse with RGB lighting and programmable buttons',
        about: [
          '16000 DPI optical sensor',
          '7 programmable buttons',
          'RGB lighting with multiple effects',
          'Up to 70 hours battery life',
          'Compatible with Windows and Mac',
        ],
        details: null,
        isActive: true,
        merchantId,
        categoryId: CategoryIds.Computers,
      },
      {
        code: 'JEANS-001',
        title: 'Slim Fit Denim Jeans',
        variationType: VariationTypes.SizeAndColor,
        description:
          'Classic slim fit jeans made from premium stretch denim for comfort and style',
        about: [
          '98% Cotton, 2% Elastane',
          'Slim fit design',
          '5-pocket styling',
          'Button fly closure',
          'Fade-resistant denim',
        ],
        details: null,
        isActive: true,
        merchantId,
        categoryId: CategoryIds.Fashion,
      },

      // INACTIVE PRODUCTS (2)
      {
        code: 'KEYBOARD-001',
        title: 'Mechanical Keyboard RGB',
        variationType: VariationTypes.NONE,
        description:
          'Mechanical gaming keyboard with Cherry MX switches and RGB backlighting',
        about: [
          'Cherry MX Red switches',
          'Per-key RGB lighting',
          'Aluminum frame',
          'Detachable USB-C cable',
          'N-key rollover',
        ],
        details: null,
        isActive: false, // INACTIVE
        merchantId,
        categoryId: CategoryIds.Computers,
      },
      {
        code: 'JACKET-001',
        title: 'Leather Jacket - Vintage Style',
        variationType: VariationTypes.OnlySize,
        description:
          'Vintage-inspired genuine leather jacket with classic biker styling',
        about: [
          'Genuine leather construction',
          'Quilted lining',
          'YKK zippers',
          'Multiple pockets',
          'Vintage distressed finish',
        ],
        details: null,
        isActive: false, // INACTIVE
        merchantId,
        categoryId: CategoryIds.Fashion,
      },
    ];
  }
}
