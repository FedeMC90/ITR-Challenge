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
}
