import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Category } from 'src/database/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getAllCategories() {
    const categories = await this.entityManager.find(Category, {
      order: { id: 'ASC' },
    });
    return categories;
  }
}
