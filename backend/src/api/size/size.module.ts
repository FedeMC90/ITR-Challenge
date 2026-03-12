import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from 'src/database/entities/size.entity';
import { SizeController } from './size.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Size])],
  controllers: [SizeController],
})
export class SizeModule {}
