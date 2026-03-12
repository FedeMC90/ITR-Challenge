import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { InventoryService } from 'src/api/inventory/services/inventory.service';
import { EventsGateway } from 'src/common/gateway/events.gateway';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { Inventory } from 'src/database/entities/inventory.entity';

/**
 * Worker que procesa jobs de la cola 'orders' de manera asíncrona
 * Esto permite que el endpoint POST /order retorne inmediatamente
 * mientras el procesamiento pesado ocurre en background
 */
@Processor('orders')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly inventoryService: InventoryService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Procesa el job 'reserve-inventory' cuando se crea una orden
   * Este proceso es ASÍNCRONO - se ejecuta después de que el usuario recibe la respuesta
   */
  @Process('reserve-inventory')
  async handleReserveInventory(job: Job) {
    const { orderId, userId, items } = job.data;

    this.logger.log(
      `🔄 Processing inventory reservation for order ${orderId} (${items.length} items)`,
    );

    try {
      // Notificar al usuario que el proceso comenzó
      this.eventsGateway.emitOrderUpdate(userId, {
        orderId,
        status: 'PROCESSING',
        message: 'Reserving inventory...',
      });

      // Procesar cada item de la orden
      for (const item of items) {
        const { productId, quantity } = item;

        // Buscar variación del producto (MVP: primera variación disponible)
        const productVariation = await this.entityManager.findOne(
          ProductVariation,
          {
            where: { productId },
          },
        );

        if (!productVariation) {
          this.logger.warn(
            `No product variation found for product ${productId}. Skipping inventory reservation.`,
          );
          continue;
        }

        // Buscar inventario disponible (MVP: primer inventario encontrado)
        const inventory = await this.entityManager.findOne(Inventory, {
          where: { productVariationId: productVariation.id },
        });

        if (!inventory) {
          this.logger.warn(
            `No inventory found for product variation ${productVariation.id}. Skipping reservation.`,
          );
          continue;
        }

        // Reservar stock usando transacción
        await this.inventoryService.reserveStock(
          productVariation.id,
          inventory.countryCode,
          quantity,
        );

        this.logger.log(
          `✅ Reserved ${quantity} units of product ${productId} in ${inventory.countryCode}`,
        );
      }

      // Notificar al usuario que el proceso terminó exitosamente
      this.eventsGateway.emitOrderUpdate(userId, {
        orderId,
        status: 'CONFIRMED',
        message:
          'Your order has been confirmed! Inventory reserved successfully.',
      });

      this.logger.log(
        `✅ Inventory reservation completed for order ${orderId}`,
      );

      return { success: true, orderId };
    } catch (error) {
      this.logger.error(
        `❌ Failed to reserve inventory for order ${orderId}:`,
        error.message,
      );

      // Notificar al usuario del error
      this.eventsGateway.emitOrderUpdate(userId, {
        orderId,
        status: 'FAILED',
        message: 'Failed to reserve inventory. Please contact support.',
        error: error.message,
      });

      throw error; // Bull reintentará el job automáticamente
    }
  }

  /**
   * Procesa el job 'release-inventory' cuando se cancela una orden
   */
  @Process('release-inventory')
  async handleReleaseInventory(job: Job) {
    const { orderId, userId, items } = job.data;

    this.logger.log(
      `🔄 Processing inventory release for order ${orderId} (${items.length} items)`,
    );

    try {
      // Notificar al usuario que el proceso comenzó
      this.eventsGateway.emitOrderUpdate(userId, {
        orderId,
        status: 'CANCELLING',
        message: 'Releasing inventory...',
      });

      // Procesar cada item de la orden
      for (const item of items) {
        const { productId, quantity } = item;

        // Buscar variación del producto
        const productVariation = await this.entityManager.findOne(
          ProductVariation,
          {
            where: { productId },
          },
        );

        if (!productVariation) {
          this.logger.warn(
            `No product variation found for product ${productId}. Skipping stock release.`,
          );
          continue;
        }

        // Buscar inventario
        const inventory = await this.entityManager.findOne(Inventory, {
          where: { productVariationId: productVariation.id },
        });

        if (!inventory) {
          this.logger.warn(
            `No inventory found for product variation ${productVariation.id}. Skipping release.`,
          );
          continue;
        }

        // Liberar stock
        await this.inventoryService.releaseStock(
          productVariation.id,
          inventory.countryCode,
          quantity,
        );

        this.logger.log(
          `✅ Released ${quantity} units of product ${productId} in ${inventory.countryCode}`,
        );
      }

      // Notificar al usuario que el proceso terminó
      this.eventsGateway.emitOrderUpdate(userId, {
        orderId,
        status: 'CANCELLED',
        message: 'Order cancelled. Inventory released successfully.',
      });

      this.logger.log(`✅ Inventory release completed for order ${orderId}`);

      return { success: true, orderId };
    } catch (error) {
      this.logger.error(
        `❌ Failed to release inventory for order ${orderId}:`,
        error.message,
      );

      throw error;
    }
  }
}
