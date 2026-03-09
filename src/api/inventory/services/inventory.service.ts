import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityManager } from 'typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { OrderCreatedEvent } from 'src/common/events/order-created.event';
import { OrderCancelledEvent } from 'src/common/events/order-cancelled.event';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async checkAvailability(
    productVariationId: number,
    countryCode: string,
    quantity: number,
  ): Promise<boolean> {
    const inventory = await this.entityManager.findOne(Inventory, {
      where: { productVariationId, countryCode },
    });

    return inventory ? inventory.quantity >= quantity : false;
  }

  async reserveStock(
    productVariationId: number,
    countryCode: string,
    quantity: number,
  ): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      const inventory = await manager.findOne(Inventory, {
        where: { productVariationId, countryCode },
      });

      if (!inventory) {
        throw new BadRequestException(
          `No inventory found for product variation ${productVariationId} in country ${countryCode}`,
        );
      }

      if (inventory.quantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`,
        );
      }

      inventory.quantity -= quantity;
      await manager.save(inventory);
    });
  }

  async releaseStock(
    productVariationId: number,
    countryCode: string,
    quantity: number,
  ): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      const inventory = await manager.findOne(Inventory, {
        where: { productVariationId, countryCode },
      });

      if (!inventory) {
        throw new BadRequestException(
          `No inventory found for product variation ${productVariationId} in country ${countryCode}`,
        );
      }

      inventory.quantity += quantity;
      await manager.save(inventory);
    });
  }

  async getInventoryByProduct(
    productVariationId: number,
  ): Promise<Inventory[]> {
    return this.entityManager.find(Inventory, {
      where: { productVariationId },
      relations: ['country'],
    });
  }

  /**
   * Event Listener: Handle order creation by reserving stock
   * Listens to 'order.created' event emitted by OrderService
   */
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(
      `Handling OrderCreatedEvent for order ${event.orderId} with ${event.items.length} items`,
    );

    for (const item of event.items) {
      try {
        // MVP Simplification: Find first product variation for this product
        const productVariation = await this.entityManager.findOne(
          ProductVariation,
          {
            where: { productId: item.productId },
          },
        );

        if (!productVariation) {
          this.logger.warn(
            `No product variation found for product ${item.productId}. Skipping inventory reservation.`,
          );
          continue;
        }

        // MVP Simplification: Find first available inventory (any country)
        const inventory = await this.entityManager.findOne(Inventory, {
          where: { productVariationId: productVariation.id },
        });

        if (!inventory) {
          this.logger.warn(
            `No inventory found for product variation ${productVariation.id}. Skipping reservation.`,
          );
          continue;
        }

        // Reserve stock using transaction-safe method
        await this.reserveStock(
          productVariation.id,
          inventory.countryCode,
          item.quantity,
        );

        this.logger.log(
          `Reserved ${item.quantity} units of product variation ${productVariation.id} in ${inventory.countryCode}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to reserve stock for product ${item.productId}: ${error.message}`,
        );
        // In production, this would trigger compensating transaction (cancel order)
        // For MVP, we log and continue
      }
    }
  }

  /**
   * Event Listener: Handle order cancellation by releasing stock
   * Listens to 'order.cancelled' event emitted by OrderService
   */
  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(
      `Handling OrderCancelledEvent for order ${event.orderId} with ${event.items.length} items`,
    );

    for (const item of event.items) {
      try {
        // Find product variation (same logic as order creation)
        const productVariation = await this.entityManager.findOne(
          ProductVariation,
          {
            where: { productId: item.productId },
          },
        );

        if (!productVariation) {
          this.logger.warn(
            `No product variation found for product ${item.productId}. Skipping stock release.`,
          );
          continue;
        }

        // Find inventory (same country where stock was reserved)
        const inventory = await this.entityManager.findOne(Inventory, {
          where: { productVariationId: productVariation.id },
        });

        if (!inventory) {
          this.logger.warn(
            `No inventory found for product variation ${productVariation.id}. Skipping release.`,
          );
          continue;
        }

        // Release stock
        await this.releaseStock(
          productVariation.id,
          inventory.countryCode,
          item.quantity,
        );

        this.logger.log(
          `Released ${item.quantity} units of product variation ${productVariation.id} in ${inventory.countryCode}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to release stock for product ${item.productId}: ${error.message}`,
        );
      }
    }
  }
}
