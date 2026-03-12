import apiClient from '../config/axios';
import type { CategoryListResponse } from '../types';

export const categoryService = {
	getAllCategories: async (): Promise<CategoryListResponse> => {
		const response = await apiClient.get<CategoryListResponse>('/category');
		return response.data;
	},
};
