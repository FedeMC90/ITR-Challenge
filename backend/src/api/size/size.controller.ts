import { Controller, Get } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Size } from 'src/database/entities/size.entity';

@Controller('size')
export class SizeController {
  constructor(private readonly entityManager: EntityManager) {}

  @Get()
  async getAllSizes() {
    return this.entityManager.find(Size, {
      order: { code: 'ASC' },
    });
  }
}
