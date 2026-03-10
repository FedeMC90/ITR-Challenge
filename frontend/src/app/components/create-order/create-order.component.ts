import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, CreateOrder } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';

interface OrderItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
})
export class CreateOrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private router = inject(Router);

  availableProducts: Product[] = [];
  orderItems: OrderItem[] = [];
  loadingProducts = false;
  submitting = false;
  error: string | null = null;
  success = false;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productService.getProducts(1, 100).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Sort products: active first, inactive last
          this.availableProducts = response.data.data.sort(
            (a, b) => Number(b.isActive) - Number(a.isActive),
          );
        }
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loadingProducts = false;
      },
    });
  }

  addProduct(product: Product) {
    // Prevent adding inactive products
    if (!product.isActive) {
      console.warn('Cannot add inactive product:', product.title);
      return;
    }

    const existing = this.orderItems.find(
      (item) => item.product.id === product.id,
    );
    if (existing) {
      existing.quantity++;
    } else {
      this.orderItems.push({ product, quantity: 1 });
    }
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
  }

  increaseQuantity(index: number) {
    this.orderItems[index].quantity++;
  }

  decreaseQuantity(index: number) {
    if (this.orderItems[index].quantity > 1) {
      this.orderItems[index].quantity--;
    }
  }

  submitOrder() {
    this.submitting = true;
    this.error = null;

    const order: CreateOrder = {
      items: this.orderItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        }
        this.submitting = false;
      },
      error: (err) => {
        this.error = 'Failed to place order. Please try again.';
        console.error('Order submission error:', err);
        this.submitting = false;
      },
    });
  }
}
