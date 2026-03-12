import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway para notificaciones en tiempo real
 * Permite comunicación bidireccional entre backend y frontend
 */
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, number>(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (userId: ${userId})`);
  }

  /**
   * Cliente se registra con su userId para recibir notificaciones personalizadas
   */
  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: number) {
    this.connectedClients.set(client.id, userId);
    client.join(`user-${userId}`); // Room privado del usuario
    this.logger.log(`User ${userId} registered on socket ${client.id}`);
    return { event: 'registered', data: { userId } };
  }

  /**
   * Emitir actualización de estado de orden a un usuario específico
   */
  emitOrderUpdate(userId: number, data: any) {
    this.server.to(`user-${userId}`).emit('order-update', data);
    this.logger.log(`Order update sent to user ${userId}:`, data);
  }

  /**
   * Emitir notificación de producto activado a todos los clientes
   */
  emitProductActivated(productId: number, product: any) {
    this.server.emit('product-activated', { productId, product });
    this.logger.log(`Product activated broadcast: ${productId}`);
  }

  /**
   * Emitir notificación de producto desactivado a todos los clientes
   */
  emitProductDeactivated(productId: number) {
    this.server.emit('product-deactivated', { productId });
    this.logger.log(`Product deactivated broadcast: ${productId}`);
  }
}
