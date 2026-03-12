import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { productVariationService } from '../services/productVariationService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import type { Product } from '../types';
import './ProductList.css';

const ProductList: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [productPrices, setProductPrices] = useState<Record<number, number | null>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

	const { isAdmin, hasRole } = useAuth();
	const { socket, isConnected } = useSocket();

	// Check if user is Admin (3) or Merchant (2)
	const canManageProducts = () => hasRole([2, 3]);

	useEffect(() => {
		loadProducts();
	}, []);

	// Listen for real-time product updates via WebSocket
	useEffect(() => {
		if (!socket || !isConnected) return;

		const handleProductActivated = (data: { productId: number; product: Product }) => {
			console.log('🟢 Product activated:', data);

			// Check if product already exists in list
			const existingIndex = products.findIndex((p) => p.id === data.productId);

			if (existingIndex >= 0) {
				// Update existing product
				setProducts((prev) => prev.map((p) => (p.id === data.productId ? { ...p, isActive: true } : p)));
			} else {
				// Add new product to list
				setProducts((prev) => [data.product, ...prev]);
				// Load price for new product
				loadProductPrices([data.product]);
			}

			showToast(`Product "${data.product.title}" is now active`, 'success');
		};

		const handleProductDeactivated = (data: { productId: number }) => {
			console.log('🔴 Product deactivated:', data);

			// Update product status to inactive
			setProducts((prev) => prev.map((p) => (p.id === data.productId ? { ...p, isActive: false } : p)));

			const product = products.find((p) => p.id === data.productId);
			if (product) {
				showToast(`Product "${product.title}" has been deactivated`, 'info');
			}
		};

		socket.on('product-activated', handleProductActivated);
		socket.on('product-deactivated', handleProductDeactivated);

		return () => {
			socket.off('product-activated', handleProductActivated);
			socket.off('product-deactivated', handleProductDeactivated);
		};
	}, [socket, isConnected, products]);

	const showToast = (message: string, type: 'info' | 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	const loadProducts = async () => {
		try {
			setLoading(true);
			const response = await productService.getProducts(1, 100);

			// Sort products: active first, inactive last
			const sortedProducts = response.data.data.sort((a, b) => Number(b.isActive) - Number(a.isActive));

			setProducts(sortedProducts);

			// Load prices for each product
			await loadProductPrices(sortedProducts);

			setError('');
		} catch (err: unknown) {
			console.error('Product load error:', err);
			setError('Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	const loadProductPrices = async (products: Product[]) => {
		const prices: Record<number, number | null> = {};

		await Promise.all(
			products.map(async (product) => {
				try {
					const response = await productVariationService.getProductVariations(product.id);
					if (response.isSuccess && response.data.length > 0) {
						// Find minimum price in USD
						let minPrice: number | null = null;

						response.data.forEach((variation) => {
							variation.prices.forEach((priceObj) => {
								if (priceObj.currencyCode === 'USD') {
									const price = typeof priceObj.price === 'string' ? parseFloat(priceObj.price) : priceObj.price;

									if (minPrice === null || price < minPrice) {
										minPrice = price;
									}
								}
							});
						});

						prices[product.id] = minPrice;
					} else {
						prices[product.id] = null;
					}
				} catch (err) {
					console.error(`Failed to load prices for product ${product.id}:`, err);
					prices[product.id] = null;
				}
			}),
		);

		setProductPrices(prices);
	};

	const handleToggleStatus = async (productId: number) => {
		try {
			await productService.toggleProductStatus(productId);
			loadProducts(); // Reload products after toggle
		} catch (err: unknown) {
			console.error('Toggle status error:', err);
			alert('Failed to toggle product status');
		}
	};

	const handleDeleteProduct = async (product: Product) => {
		const confirmDelete = window.confirm(
			`Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`,
		);

		if (!confirmDelete) return;

		try {
			await productService.deleteProduct(product.id);
			alert('Product deleted successfully');
			loadProducts(); // Reload products after delete
		} catch (err: any) {
			console.error('Delete product error:', err);

			// Check if error is about product having orders
			const errorMessage = err?.response?.data?.message || '';
			if (errorMessage.includes('existing orders') || errorMessage.includes('hasOrders')) {
				alert(
					`Cannot delete "${product.title}" because it has existing orders.\n\n` +
						`You can deactivate this product instead to hide it from customers while preserving order history.`,
				);
			} else {
				alert('Failed to delete product. Please try again or contact support.');
			}
		}
	};

	const handleOpenDetails = async (productId: number) => {
		try {
			setLoadingDetails(true);
			setShowModal(true);
			const productDetails = await productService.getProduct(productId);
			setSelectedProduct(productDetails);
		} catch (err) {
			console.error('Failed to load product details:', err);
			alert('Failed to load product details');
			setShowModal(false);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedProduct(null);
	};

	if (loading) {
		return <div className='loading'>Loading products...</div>;
	}

	if (error) {
		return <div className='error'>{error}</div>;
	}

	return (
		<div className='product-list-container'>
			<h2>Product List</h2>

			{products.length === 0 ? (
				<p className='no-products'>No products found</p>
			) : (
				<div className='product-grid'>
					{products.map((product) => (
						<div
							key={product.id}
							className={`product-card ${!product.isActive ? 'inactive' : ''}`}
							onClick={() => handleOpenDetails(product.id)}
							style={{ cursor: 'pointer' }}
						>
							<div className='product-header'>
								<div className='title-section'>
									<h3>{product.title || 'Untitled Product'}</h3>
								</div>
								<span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
									{product.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>

							<div className='product-info'>
								<p>
									<strong>Code:</strong> {product.code}
								</p>
								<p>
									<strong>Description:</strong> {product.description || 'No description'}
								</p>
								<p>
									<strong>Variation:</strong> {product.variationType || 'N/A'}
								</p>
								<p className='product-price'>
									<strong>Price:</strong>{' '}
									{productPrices[product.id] !== undefined ? (
										productPrices[product.id] !== null ? (
											<span className='price-value'>${productPrices[product.id]!.toFixed(2)} USD</span>
										) : (
											<span className='price-unavailable'>Not available</span>
										)
									) : (
										<span className='price-loading'>Loading...</span>
									)}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Product Details Modal */}
			{showModal && (
				<div
					className='modal-overlay'
					onClick={handleCloseModal}
				>
					<div
						className='modal-content'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='modal-header'>
							<h2>Product Details</h2>
							<button
								className='close-button'
								onClick={handleCloseModal}
							>
								✕
							</button>
						</div>

						{loadingDetails ? (
							<div className='modal-loading'>Loading details...</div>
						) : selectedProduct ? (
							<>
								<div className='modal-body'>
									<div className='detail-section'>
										<h3>{selectedProduct.title}</h3>
										<p className='product-code'>
											<strong>Code:</strong> {selectedProduct.code}
										</p>
										<p className={`status-indicator ${selectedProduct.isActive ? 'active' : 'inactive'}`}>
											<strong>Status:</strong> {selectedProduct.isActive ? 'Active' : 'Inactive'}
										</p>
									</div>

									<div className='detail-section'>
										<h4>Description</h4>
										<p>{selectedProduct.description || 'No description available'}</p>
									</div>

									<div className='detail-section'>
										<h4>Variation Type</h4>
										<p>{selectedProduct.variationType || 'N/A'}</p>
									</div>

									{selectedProduct.about && selectedProduct.about.length > 0 && (
										<div className='detail-section'>
											<h4>About</h4>
											<ul className='about-list'>
												{selectedProduct.about.map((item, index) => (
													<li key={index}>{item}</li>
												))}
											</ul>
										</div>
									)}

									{selectedProduct.details && (
										<div className='detail-section'>
											<h4>Technical Details</h4>
											<div className='details-grid'>
												{selectedProduct.details.category === 'Computers' && (
													<>
														<div className='detail-item'>
															<strong>Brand:</strong> {selectedProduct.details.brand}
														</div>
														<div className='detail-item'>
															<strong>Series:</strong> {selectedProduct.details.series}
														</div>
														<div className='detail-item'>
															<strong>Capacity:</strong> {selectedProduct.details.capacity}{' '}
															{selectedProduct.details.capacityUnit}
														</div>
														<div className='detail-item'>
															<strong>Type:</strong> {selectedProduct.details.capacityType}
														</div>
													</>
												)}
												{selectedProduct.details.category === 'Fashion' && (
													<>
														<div className='detail-item'>
															<strong>Brand:</strong> {selectedProduct.details.brand}
														</div>
														<div className='detail-item'>
															<strong>Material:</strong> {selectedProduct.details.material}
														</div>
														<div className='detail-item'>
															<strong>Season:</strong> {selectedProduct.details.season}
														</div>
													</>
												)}
											</div>
										</div>
									)}

									{productPrices[selectedProduct.id] !== undefined && (
										<div className='detail-section price-section'>
											<h4>Price</h4>
											<p className='detail-price'>
												{productPrices[selectedProduct.id] !== null ? (
													<span className='price-amount'>${productPrices[selectedProduct.id]!.toFixed(2)} USD</span>
												) : (
													<span className='price-unavailable'>Not available</span>
												)}
											</p>
										</div>
									)}
								</div>

								<div className='modal-footer'>
									{isAdmin() && (
										<button
											onClick={() => {
												handleToggleStatus(selectedProduct.id);
												handleCloseModal();
											}}
											className={`modal-toggle-button ${selectedProduct.isActive ? 'deactivate' : 'activate'}`}
										>
											{selectedProduct.isActive ? 'Deactivate Product' : 'Activate Product'}
										</button>
									)}
									{canManageProducts() && (
										<button
											onClick={() => {
												handleDeleteProduct(selectedProduct);
												handleCloseModal();
											}}
											className='modal-delete-button'
										>
											Delete Product
										</button>
									)}
								</div>
							</>
						) : (
							<div className='modal-error'>Failed to load product details</div>
						)}
					</div>
				</div>
			)}

			{/* Toast Notification */}
			{toast && (
				<div className={`toast toast-${toast.type}`}>
					<span>{toast.message}</span>
				</div>
			)}
		</div>
	);
};

export default ProductList;
