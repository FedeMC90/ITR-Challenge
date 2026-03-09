import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
