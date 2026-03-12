import apiClient from '../config/axios';
import type { CreateVariationsPayload, ProductVariation, SetVariationPricePayload, ApiResponse } from '../types';

export const productVariationService = {
	createVariations: async (
		productId: number,
		data: CreateVariationsPayload,
	): Promise<ApiResponse<ProductVariation[]>> => {
		const response = await apiClient.post<ApiResponse<ProductVariation[]>>(`/product/${productId}/variations`, data);
		return response.data;
	},

	getProductVariations: async (productId: number): Promise<ApiResponse<ProductVariation[]>> => {
		const response = await apiClient.get<ApiResponse<ProductVariation[]>>(`/product/${productId}/variations`);
		return response.data;
	},

	setVariationPrice: async (variationId: number, data: SetVariationPricePayload): Promise<ApiResponse<any>> => {
		const response = await apiClient.post<ApiResponse<any>>(`/product/variation/${variationId}/price`, data);
		return response.data;
	},
};
