import apiClient from '../config/axios';
import type { Size } from '../types';

export const sizeService = {
	getAllSizes: async (): Promise<Size[]> => {
		try {
			const response = await apiClient.get('/size');
			// Backend might return array directly or wrapped in data property
			const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
			return data as Size[];
		} catch (error) {
			console.error('Failed to load sizes:', error);
			return [];
		}
	},
};
