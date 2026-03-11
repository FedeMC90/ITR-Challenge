import apiClient from '../config/axios';
import type { RoleListResponse, Role, AssignRoleRequest, ApiResponse } from '../types';

export const roleService = {
	getAllRoles: async (): Promise<Role[]> => {
		const response = await apiClient.get<RoleListResponse>('/role');
		return response.data.data;
	},

	assignRole: async (data: AssignRoleRequest): Promise<ApiResponse> => {
		const response = await apiClient.post<ApiResponse>('/role/assign', data);
		return response.data;
	},

	removeRole: async (data: AssignRoleRequest): Promise<ApiResponse> => {
		const response = await apiClient.post<ApiResponse>('/role/remove', data);
		return response.data;
	},
};
