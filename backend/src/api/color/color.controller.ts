import { Controller, Get } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Color } from 'src/database/entities/color.entity';

@Controller('color')
export class ColorController {
  constructor(private readonly entityManager: EntityManager) {}

  @Get()
  async getAllColors() {
    return this.entityManager.find(Color, {
      order: { name: 'ASC' },
    });
  }
}
