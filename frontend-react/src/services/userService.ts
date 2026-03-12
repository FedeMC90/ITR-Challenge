import apiClient from '../config/axios';
import type { UserListResponse, User, UserProfileResponse } from '../types';

export const userService = {
	getAllUsers: async (): Promise<User[]> => {
		const response = await apiClient.get<UserListResponse>('/user');
		return response.data.data;
	},

	getUserProfile: async (): Promise<User> => {
		const response = await apiClient.get<UserProfileResponse>('/user/profile');
		return response.data.data;
	},
};
