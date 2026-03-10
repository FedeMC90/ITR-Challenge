import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrder {
  items: CreateOrderItem[];
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: any;
}

export interface OrderResponse {
  isSuccess: boolean;
  data: Order;
}

export interface OrderListResponse {
  isSuccess: boolean;
  data: Order[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  createOrder(order: CreateOrder): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${environment.apiUrl}/order`, order);
  }

  getMyOrders(): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(`${environment.apiUrl}/order`);
  }

  cancelOrder(orderId: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${environment.apiUrl}/order/${orderId}/cancel`,
      {},
    );
  }
}
