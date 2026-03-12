import React, { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import './OrderList.css';

const OrderList: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadOrders();
	}, []);

	const loadOrders = async () => {
		try {
			setLoading(true);
			const response = await orderService.getMyOrders();
			setOrders(response.data || []);
			setError('');
		} catch (err: unknown) {
			console.error('Failed to load orders:', err);
			setError('Failed to load orders');
		} finally {
			setLoading(false);
		}
	};

	const handleCancelOrder = async (orderId: number) => {
		if (!confirm('Are you sure you want to cancel this order?')) {
			return;
		}

		try {
			await orderService.cancelOrder(orderId);
			loadOrders(); // Reload orders
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				alert(axiosError.response?.data?.message || 'Failed to cancel order');
			} else {
				alert('Failed to cancel order');
			}
		}
	};

	if (loading) {
		return <div className='loading'>Loading orders...</div>;
	}

	if (error) {
		return <div className='error'>{error}</div>;
	}

	return (
		<div className='order-list-container'>
			<h2>My Orders</h2>

			{orders.length === 0 ? (
				<p className='no-orders'>No orders found</p>
			) : (
				<div className='orders-grid'>
					{orders.map((order) => (
						<div
							key={order.id}
							className='order-card'
						>
							<div className='order-header'>
								<h3>Order #{order.id}</h3>
								<div className='header-actions'>
									<span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
									{order.status.toLowerCase() === 'pending' && (
										<button
											onClick={() => handleCancelOrder(order.id)}
											className='cancel-icon-button'
											title='Cancel order'
										>
											✖
										</button>
									)}
								</div>
							</div>

							<div className='order-info'>
								<p>
									<strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}
								</p>
								<p>
									<strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
								</p>
							</div>

							<div className='order-items'>
								<h4>Items:</h4>
								{order.items && order.items.length > 0 ? (
									<>
										<ul>
											{order.items.map((item) => (
												<li key={item.id}>
													{item.product?.title || `Product #${item.productId}`} - Qty: {item.quantity} - $
													{Number(item.price).toFixed(2)} each
												</li>
											))}
										</ul>
										<div className='order-total'>
											<strong>Total: ${Number(order.totalAmount).toFixed(2)}</strong>
										</div>
									</>
								) : (
									<p>No items</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrderList;
