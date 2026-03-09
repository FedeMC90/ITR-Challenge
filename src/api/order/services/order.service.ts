import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Order, OrderStatus } from 'src/database/entities/order.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { Product } from 'src/database/entities/product.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { errorMessages } from 'src/errors/custom';

@Injectable()
export class OrderService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    return await this.entityManager.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        totalAmount: 0,
      });
      await manager.save(order);

      // Create order items and calculate total
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.productId} not found`,
          );
        }

        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: 0, // Price would come from product variations - simplified for MVP
        });

        orderItems.push(orderItem);
        totalAmount += orderItem.price * item.quantity;
      }

      await manager.save(orderItems);

      // Update order total
      order.totalAmount = totalAmount;
      await manager.save(order);

      // Return order with items
      return await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items', 'items.product'],
      });
    });
  }

  async getOrdersByUser(userId: number) {
    return await this.entityManager.find(Order, {
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
