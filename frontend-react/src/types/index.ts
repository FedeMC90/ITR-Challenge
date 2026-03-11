// User & Auth Types
export interface UserRole {
	id: number;
	name: string;
}

export interface User {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	roles: UserRole[];
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	isSuccess: boolean;
	message: string;
	data: {
		user: User;
		access_token: string;
	};
	errorCode: string | null;
	errors: string[];
}

// Product Types
export interface Category {
	id: number;
	name: string;
}

export interface CategoryListResponse {
	isSuccess: boolean;
	data: Category[];
}

export interface Product {
	id: number;
	code: string;
	title: string;
	description: string;
	isActive: boolean;
	variationType: string;
}

export interface ProductResponse {
	isSuccess: boolean;
	data: {
		data: Product[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	};
}

export interface ProductCreateResponse {
	isSuccess: boolean;
	data: {
		id: number;
		categoryId: number;
	};
}

export interface ProductDetailsPayload {
	title: string;
	code: string;
	description: string;
	variationType: string;
	about: string[];
	details: Record<string, unknown>;
}

// Order Types
export interface CreateOrderItem {
	productId: number;
	quantity: number;
}

export interface CreateOrder {
	items: CreateOrderItem[];
}

export interface OrderItem {
	id: number;
	productId: number;
	quantity: number;
	price: number;
	product: Product;
}

export interface Order {
	id: number;
	userId: number;
	totalAmount: number;
	status: string;
	createdAt: string;
	items: OrderItem[];
}

export interface OrderResponse {
	isSuccess: boolean;
	data: Order;
}

export interface OrderListResponse {
	isSuccess: boolean;
	data: Order[];
}

// Role Types
export interface Role {
	id: number;
	name: string;
}

export interface AssignRoleRequest {
	userId: number;
	roleId: number;
}

export interface RoleListResponse {
	isSuccess: boolean;
	data: Role[];
}

export interface UserListResponse {
	isSuccess: boolean;
	data: User[];
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
	isSuccess: boolean;
	message: string;
	data: T;
	errorCode: string | null;
	errors: string[];
}
