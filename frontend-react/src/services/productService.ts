import apiClient from '../config/axios';
import type {
	ProductResponse,
	ProductCreateResponse,
	ProductDetailsPayload,
	CreateProductPayload,
	ApiResponse,
	Product,
} from '../types';

export const productService = {
	getProducts: async (page: number = 1, limit: number = 10): Promise<ProductResponse> => {
		const response = await apiClient.get<ProductResponse>(`/product?page=${page}&limit=${limit}`);
		return response.data;
	},

	getProduct: async (productId: number): Promise<Product> => {
		const response = await apiClient.get<ApiResponse<Product>>(`/product/${productId}`);
		return response.data.data;
	},

	createProduct: async (productData: CreateProductPayload): Promise<ProductCreateResponse> => {
		const response = await apiClient.post<ProductCreateResponse>('/product/create', productData);
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

	deleteProduct: async (productId: number): Promise<ApiResponse<void>> => {
		const response = await apiClient.delete<ApiResponse<void>>(`/product/${productId}`);
		return response.data;
	},
};
