import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types';
import './ProductList.css';

const ProductList: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { isAdmin } = useAuth();

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
		} catch (err: unknown) {
			console.error('Product load error:', err);
			setError('Failed to load products');
		} finally {
			setLoading(false);
		}
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
								<h3>{product.title || 'Untitled Product'}</h3>
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
