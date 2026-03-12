import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, AuthResponse } from '../types';
import apiClient from '../config/axios';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	login: (credentials: LoginRequest) => Promise<AuthResponse>;
	register: (credentials: LoginRequest) => Promise<AuthResponse>;
	logout: () => void;
	hasRole: (roleIds: number[]) => boolean;
	isAdmin: () => boolean;
	canCreateProducts: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export context for useAuth hook
export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	// Lazy initialization: load user from localStorage on first render
	const [user, setUser] = useState<User | null>(() => {
		const userData = localStorage.getItem('user_data');
		if (userData) {
			try {
				return JSON.parse(userData);
			} catch (error) {
				console.error('Failed to parse user data:', error);
				localStorage.removeItem('user_data');
				localStorage.removeItem('access_token');
				return null;
			}
		}
		return null;
	});

	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
		const token = localStorage.getItem('access_token');
		const userData = localStorage.getItem('user_data');
		return !!token && !!userData;
	});

	const clearStorage = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('user_data');
	};

	const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
		const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

		if (response.data.isSuccess) {
			const { user: userData, access_token } = response.data.data;
			localStorage.setItem('access_token', access_token);
			localStorage.setItem('user_data', JSON.stringify(userData));
			setUser(userData);
			setIsAuthenticated(true);
		}

		return response.data;
	};

	const register = async (credentials: LoginRequest): Promise<AuthResponse> => {
		const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
		return response.data;
	};

	const logout = () => {
		clearStorage();
		setUser(null);
		setIsAuthenticated(false);
	};

	const hasRole = (roleIds: number[]): boolean => {
		if (!user || !user.roles) return false;
		return user.roles.some((role) => roleIds.includes(role.id));
	};

	const isAdmin = (): boolean => {
		return hasRole([3]); // RoleId.Admin = 3
	};

	const canCreateProducts = (): boolean => {
		return hasRole([2, 3]); // RoleId.Merchant = 2, RoleId.Admin = 3
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				login,
				register,
				logout,
				hasRole,
				isAdmin,
				canCreateProducts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
