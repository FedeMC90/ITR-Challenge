import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  variationType: string;
}

export interface ProductResponse {
  isSuccess: boolean;
  data: {
    data: Product[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProductCreateResponse {
  isSuccess: boolean;
  data: {
    id: number;
    categoryId: number;
  };
}

export interface ProductDetailsResponse {
  isSuccess: boolean;
  data: Product;
}

export interface ProductDetailsPayload {
  title: string;
  code: string;
  description: string;
  variationType: string;
  about: string[];
  details: any;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(
    page: number = 1,
    limit: number = 10,
  ): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${environment.apiUrl}/product?page=${page}&limit=${limit}`,
    );
  }

  createProduct(categoryId: number): Observable<ProductCreateResponse> {
    return this.http.post<ProductCreateResponse>(
      `${environment.apiUrl}/product/create`,
      { categoryId },
    );
  }

  addProductDetails(
    productId: number,
    details: ProductDetailsPayload,
  ): Observable<ProductDetailsResponse> {
    return this.http.post<ProductDetailsResponse>(
      `${environment.apiUrl}/product/${productId}/details`,
      details,
    );
  }

  activateProduct(productId: number): Observable<ProductDetailsResponse> {
    return this.http.post<ProductDetailsResponse>(
      `${environment.apiUrl}/product/${productId}/activate`,
      {},
    );
  }

  toggleProductStatus(productId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/product/${productId}/toggle-status`,
      {},
    );
  }
}
