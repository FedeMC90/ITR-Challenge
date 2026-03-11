import apiClient from '../config/axios';
import type { UserListResponse, User } from '../types';

export const userService = {
	getAllUsers: async (): Promise<User[]> => {
		const response = await apiClient.get<UserListResponse>('/user');
		return response.data.data;
	},
};
