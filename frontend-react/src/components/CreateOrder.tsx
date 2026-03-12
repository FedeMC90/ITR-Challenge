import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useSocket } from '../hooks/useSocket';
import type { Product, CreateOrderItem } from '../types';
import './CreateOrder.css';

type OrderStatus = 'idle' | 'creating' | 'processing' | 'confirmed' | 'failed';

const CreateOrder: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [orderItems, setOrderItems] = useState<CreateOrderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
	const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

	const navigate = useNavigate();
	const { socket, isConnected } = useSocket();

	useEffect(() => {
		loadProducts();
	}, []);

	// Listen for WebSocket order updates
	useEffect(() => {
		if (!socket || !isConnected) return;

		const handleOrderUpdate = (data: { orderId: number; status: string; message?: string }) => {
			console.log('📦 Order update received:', data);

			// Only process updates for the current order
			if (currentOrderId && data.orderId === currentOrderId) {
				const status = data.status.toUpperCase();

				if (status === 'PROCESSING') {
					setOrderStatus('processing');
				} else if (status === 'CONFIRMED') {
					setOrderStatus('confirmed');
					// Navigate to orders page after a short delay
					setTimeout(() => {
						navigate('/orders');
					}, 2000);
				} else if (status === 'FAILED') {
					setOrderStatus('failed');
					alert(data.message || 'Order processing failed');
					// Reset after showing error
					setTimeout(() => {
						setOrderStatus('idle');
						setCurrentOrderId(null);
					}, 3000);
				}
			}
		};

		socket.on('order-update', handleOrderUpdate);

		return () => {
			socket.off('order-update', handleOrderUpdate);
		};
	}, [socket, isConnected, currentOrderId, navigate]);

	const loadProducts = async () => {
		try {
			setLoading(true);
			const response = await productService.getProducts(1, 100);

			// Sort products: active first, inactive last
			const sortedProducts = response.data.data.sort((a, b) => Number(b.isActive) - Number(a.isActive));

			setProducts(sortedProducts);
			setError('');
		} catch (err: unknown) {
			console.error('Failed to load products:', err);
			setError('Failed to load products');
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
			setOrderStatus('creating');
			const response = await orderService.createOrder({ items: orderItems });

			if (response.isSuccess && response.data) {
				// Order created successfully, now waiting for async processing
				setCurrentOrderId(response.data.id);
				// Status will be updated via WebSocket
				console.log('✅ Order created, waiting for processing updates...');
			}
		} catch (err: unknown) {
			setOrderStatus('failed');
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				alert(axiosError.response?.data?.message || 'Failed to create order');
			} else {
				alert('Failed to create order');
			}
			// Reset status after error
			setTimeout(() => {
				setOrderStatus('idle');
			}, 2000);
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

							{/* Order Status Indicator */}
							{orderStatus !== 'idle' && (
								<div className={`order-status order-status-${orderStatus}`}>
									{orderStatus === 'creating' && (
										<>
											<span className='status-spinner'>⏳</span>
											<span>Creating order...</span>
										</>
									)}
									{orderStatus === 'processing' && (
										<>
											<span className='status-spinner'>🔄</span>
											<span>Processing order... Reserving inventory...</span>
										</>
									)}
									{orderStatus === 'confirmed' && (
										<>
											<span className='status-success'>✅</span>
											<span>Order confirmed! Redirecting...</span>
										</>
									)}
									{orderStatus === 'failed' && (
										<>
											<span className='status-error'>❌</span>
											<span>Order processing failed</span>
										</>
									)}
								</div>
							)}

							<button
								onClick={handleCreateOrder}
								className='create-order-button'
								disabled={orderStatus !== 'idle'}
							>
								{orderStatus === 'idle' ? 'Create Order' : 'Processing...'}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateOrder;
