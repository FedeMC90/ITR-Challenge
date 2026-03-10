import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  products: Product[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  isAuthenticated$ = this.authService.isAuthenticated$;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(page, 10).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.products = response.data.data;
          this.currentPage = response.data.meta.page;
          this.totalPages = response.data.meta.totalPages;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        console.error('Product load error:', err);
        this.loading = false;
      },
    });
  }

  loadPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
    }
  }

  addToOrder(product: Product) {
    // Navigate to order page with product pre-selected
    console.log('Add to order:', product);
    // This would be implemented with a shopping cart service in production
    alert(`Product "${product.title}" added to order (feature coming soon)`);
  }

  navigateToCreate() {
    this.router.navigate(['/create-product']);
  }
}
