import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { productVariationService } from '../services/productVariationService';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types';
import './ProductList.css';

const ProductList: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [productPrices, setProductPrices] = useState<Record<number, number | null>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { isAdmin, hasRole } = useAuth();

	// Check if user is Admin (3) or Merchant (2)
	const canManageProducts = () => hasRole([2, 3]);

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
						>
							<div className='product-header'>
								<div className='title-section'>
									<h3>{product.title || 'Untitled Product'}</h3>
								</div>
								<div className='header-actions'>
									<span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
										{product.isActive ? 'Active' : 'Inactive'}
									</span>
									{canManageProducts() && (
										<button
											onClick={() => handleDeleteProduct(product)}
											className='delete-button'
											title='Delete product'
										>
											🗑️
										</button>
									)}
								</div>
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

							{isAdmin() && (
								<button
									onClick={() => handleToggleStatus(product.id)}
									className='toggle-button'
								>
									{product.isActive ? 'Deactivate' : 'Activate'}
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ProductList;
