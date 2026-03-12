import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EntityManager } from 'typeorm';
import { Order, OrderStatus } from 'src/database/entities/order.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariationPrice } from 'src/database/entities/productVariation_price.entity';
import { CreateOrderDto } from '../dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectQueue('orders')
    private readonly ordersQueue: Queue,
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

        // Get minimum price in USD for this product from variations
        const productPrice = await manager
          .createQueryBuilder(ProductVariationPrice, 'price')
          .innerJoin('price.productVariation', 'variation')
          .where('variation.productId = :productId', {
            productId: product.id,
          })
          .andWhere('price.currencyCode = :currency', { currency: 'USD' })
          .orderBy('price.price', 'ASC')
          .getOne();

        const price = productPrice ? Number(productPrice.price) : 0;

        if (price === 0) {
          throw new NotFoundException(
            `No price found for product ${product.title}. Please configure product variations and prices first.`,
          );
        }

        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: price,
        });

        orderItems.push(orderItem);
        totalAmount += orderItem.price * item.quantity;
      }

      await manager.save(orderItems);

      // Update order total
      order.totalAmount = totalAmount;
      await manager.save(order);

      // Return order with items
      const createdOrder = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items', 'items.product'],
      });

      // ASYNC: Add job to queue for inventory reservation
      // This allows immediate response to client while processing happens in background
      await this.ordersQueue.add('reserve-inventory', {
        orderId: order.id,
        userId,
        items: createOrderDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      return createdOrder;
    });
  }

  async getOrdersByUser(userId: number) {
    return await this.entityManager.find(Order, {
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelOrder(orderId: number, userId: number) {
    return await this.entityManager.transaction(async (manager) => {
      // Find order and verify ownership
      const order = await manager.findOne(Order, {
        where: { id: orderId, userId },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${orderId} not found`);
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error('Order is already cancelled');
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await manager.save(order);

      // ASYNC: Add job to queue for inventory release
      await this.ordersQueue.add('release-inventory', {
        orderId: order.id,
        userId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      return order;
    });
  }
}
