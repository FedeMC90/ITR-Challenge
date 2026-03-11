import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import type { Product, CreateOrderItem } from '../types';
import './CreateOrder.css';

const CreateOrder: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [orderItems, setOrderItems] = useState<CreateOrderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			setLoading(true);
			const response = await productService.getProducts(1, 100);

			// Sort products: active first, inactive last
			const sortedProducts = response.data.data.sort((a, b) => Number(b.isActive) - Number(a.isActive));

			setProducts(sortedProducts);
			setError('');
		} catch (err: unknown) {		console.error('Failed to load products:', err);			setError('Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	const addProduct = (product: Product) => {
		if (!product.isActive) {
			alert('Cannot add inactive product to order');
			return;
		}

		const existingItem = orderItems.find((item) => item.productId === product.id);

		if (existingItem) {
			setOrderItems(
				orderItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
			);
		} else {
			setOrderItems([...orderItems, { productId: product.id, quantity: 1 }]);
		}
	};

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 1) {
			removeProduct(productId);
			return;
		}

		setOrderItems(orderItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
	};

	const removeProduct = (productId: number) => {
		setOrderItems(orderItems.filter((item) => item.productId !== productId));
	};

	const handleCreateOrder = async () => {
		if (orderItems.length === 0) {
			alert('Please add at least one product to the order');
			return;
		}

		try {
			const response = await orderService.createOrder({ items: orderItems });
			if (response.isSuccess) {
				alert('Order created successfully!');
				navigate('/orders');
			}
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				alert(axiosError.response?.data?.message || 'Failed to create order');
			} else {
				alert('Failed to create order');
			}
		}
	};

	if (loading) {
		return <div className='loading'>Loading products...</div>;
	}

	if (error) {
		return <div className='error'>{error}</div>;
	}

	return (
		<div className='create-order-container'>
			<h2>Create Order</h2>

			<div className='order-layout'>
				<div className='products-section'>
					<h3>Available Products</h3>
					{products.length === 0 ? (
						<p>No products available</p>
					) : (
						<div className='product-list'>
							{products.map((product) => (
								<div
									key={product.id}
									className={`product-item ${!product.isActive ? 'inactive' : ''}`}
								>
									<div className='product-details'>
										<h4>{product.title || 'Untitled'}</h4>
										<p>{product.code}</p>
										{!product.isActive && <span className='inactive-badge'>Inactive</span>}
									</div>
									<button
										onClick={() => addProduct(product)}
										disabled={!product.isActive}
										className='add-button'
										title={!product.isActive ? 'Cannot add inactive product' : ''}
									>
										Add
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className='cart-section'>
					<h3>Order Items</h3>
					{orderItems.length === 0 ? (
						<p className='empty-cart'>No items in cart</p>
					) : (
						<>
							<div className='cart-items'>
								{orderItems.map((item) => {
									const product = products.find((p) => p.id === item.productId);
									return (
										<div
											key={item.productId}
											className='cart-item'
										>
											<div className='cart-item-info'>
												<strong>{product?.title || 'Product'}</strong>
												<span>{product?.code}</span>
											</div>
											<div className='cart-item-controls'>
												<input
													type='number'
													value={item.quantity}
													onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
													min='1'
													className='quantity-input'
												/>
												<button
													onClick={() => removeProduct(item.productId)}
													className='remove-button'
												>
													Remove
												</button>
											</div>
										</div>
									);
								})}
							</div>

							<button
								onClick={handleCreateOrder}
								className='create-order-button'
							>
								Create Order
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateOrder;
