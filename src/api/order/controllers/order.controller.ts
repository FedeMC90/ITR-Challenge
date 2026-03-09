import { Body, Controller, Get, Patch, Param, Post } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/order.dto';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { CurrentUser } from 'src/api/auth/guards/user.decorator';
import { User } from 'src/database/entities/user.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.orderService.createOrder(user.id, createOrderDto);
  }

  @Auth()
  @Get()
  async getMyOrders(@CurrentUser() user: User) {
    return this.orderService.getOrdersByUser(user.id);
  }

  @Auth()
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.orderService.cancelOrder(parseInt(id), user.id);
  }
}
