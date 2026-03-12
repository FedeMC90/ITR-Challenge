import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Order } from 'src/database/entities/order.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { OrderProcessor } from './processors/order.processor';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { EventsGateway } from 'src/common/gateway/events.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    // Registrar cola 'orders' para procesamiento asíncrono
    BullModule.registerQueue({
      name: 'orders',
    }),
    UserModule,
    AuthModule,
    InventoryModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor, EventsGateway],
  exports: [OrderService],
})
export class OrderModule {}
