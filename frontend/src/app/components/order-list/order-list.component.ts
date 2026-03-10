import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  cancellingOrders: { [key: number]: boolean } = {};

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = null;

    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.orders = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again later.';
        console.error('Order load error:', err);
        this.loading = false;
      },
    });
  }

  cancelOrder(orderId: number) {
    if (
      !confirm(
        'Are you sure you want to cancel this order? This will release the reserved inventory.',
      )
    ) {
      return;
    }

    this.cancellingOrders[orderId] = true;

    this.orderService.cancelOrder(orderId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Update order in list
          const order = this.orders.find((o) => o.id === orderId);
          if (order) {
            order.status = 'CANCELLED';
          }
        }
        this.cancellingOrders[orderId] = false;
      },
      error: (err) => {
        alert('Failed to cancel order. Please try again.');
        console.error('Cancel order error:', err);
        this.cancellingOrders[orderId] = false;
      },
    });
  }
}
