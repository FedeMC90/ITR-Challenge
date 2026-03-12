import apiClient from '../config/axios';
import type { Color } from '../types';

export const colorService = {
	getAllColors: async (): Promise<Color[]> => {
		try {
			const response = await apiClient.get('/color');
			// Backend might return array directly or wrapped in data property
			const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
			return data as Color[];
		} catch (error) {
			console.error('Failed to load colors:', error);
			return [];
		}
	},
};
