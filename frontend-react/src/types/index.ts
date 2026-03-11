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

export interface ComputerDetails {
	category: 'Computers';
	capacity: number;
	capacityUnit: 'GB' | 'TB';
	capacityType: 'SSD' | 'HD';
	brand: string;
	series: string;
}

export interface FashionDetails {
	category: 'Fashion';
	material: string;
	brand: string;
	size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
	season: string;
}

export type ProductDetails = ComputerDetails | FashionDetails;

export interface CreateProductPayload {
	categoryId: number;
	title: string;
	code: string;
	description: string;
	variationType: string;
	about: string[];
	details: ProductDetails;
}

export interface ProductDetailsPayload {
	title: string;
	code: string;
	description: string;
	variationType: string;
	about: string[];
	details: ProductDetails;
}

// Product Variation Types
export interface VariationItem {
	colorName: string;
	sizeCode: string;
	imageUrls?: string[];
}

export interface CreateVariationsPayload {
	variations: VariationItem[];
	basePrice: number;
	currencyCode?: string;
	countryCode?: string;
}

export interface ProductVariationPrice {
	id: number;
	price: number | string;
	currencyCode: string;
	countryCode: string;
}

export interface ProductVariation {
	id: number;
	productId: number;
	colorName: string;
	sizeCode: string;
	imageUrls: string[];
	prices: ProductVariationPrice[];
}

export interface SetVariationPricePayload {
	price: number;
	currencyCode: string;
	countryCode: string;
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
	price: number | string; // Backend returns DECIMAL as string
	product: Product;
}

export interface Order {
	id: number;
	userId: number;
	totalAmount: number | string; // Backend returns DECIMAL as string
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
