import apiClient from '../config/axios';
import type { CreateOrder, OrderResponse, OrderListResponse } from '../types';

export const orderService = {
	createOrder: async (order: CreateOrder): Promise<OrderResponse> => {
		const response = await apiClient.post<OrderResponse>('/order', order);
		return response.data;
	},

	getMyOrders: async (): Promise<OrderListResponse> => {
		const response = await apiClient.get<OrderListResponse>('/order');
		return response.data;
	},

	cancelOrder: async (orderId: number): Promise<OrderResponse> => {
		const response = await apiClient.patch<OrderResponse>(`/order/${orderId}/cancel`, {});
		return response.data;
	},
};
