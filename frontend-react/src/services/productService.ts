import apiClient from '../config/axios';
import type { ProductResponse, ProductCreateResponse, ProductDetailsPayload, ApiResponse, Product } from '../types';

export const productService = {
	getProducts: async (page: number = 1, limit: number = 10): Promise<ProductResponse> => {
		const response = await apiClient.get<ProductResponse>(`/product?page=${page}&limit=${limit}`);
		return response.data;
	},

	createProduct: async (categoryId: number): Promise<ProductCreateResponse> => {
		const response = await apiClient.post<ProductCreateResponse>('/product/create', {
			categoryId,
		});
		return response.data;
	},

	addProductDetails: async (productId: number, details: ProductDetailsPayload): Promise<ApiResponse<Product>> => {
		const response = await apiClient.post<ApiResponse<Product>>(`/product/${productId}/details`, details);
		return response.data;
	},

	activateProduct: async (productId: number): Promise<ApiResponse<Product>> => {
		const response = await apiClient.post<ApiResponse<Product>>(`/product/${productId}/activate`, {});
		return response.data;
	},

	toggleProductStatus: async (productId: number): Promise<ApiResponse<Product>> => {
		const response = await apiClient.post<ApiResponse<Product>>(`/product/${productId}/toggle-status`, {});
		return response.data;
	},
};
