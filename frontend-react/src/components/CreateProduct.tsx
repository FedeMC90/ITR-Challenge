import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import type { Category, ComputerDetails, FashionDetails, ProductDetails } from '../types';
import './CreateProduct.css';

const CreateProduct: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryId, setCategoryId] = useState('1');
	const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
	const [productId, setProductId] = useState<number | null>(null);

	// Basic fields
	const [title, setTitle] = useState('');
	const [code, setCode] = useState('');
	const [description, setDescription] = useState('');
	const [variationType, setVariationType] = useState('NONE');
	const [about, setAbout] = useState<string[]>(['']);

	// Computer-specific fields
	const [capacity, setCapacity] = useState(512);
	const [capacityUnit, setCapacityUnit] = useState<'GB' | 'TB'>('GB');
	const [capacityType, setCapacityType] = useState<'SSD' | 'HD'>('SSD');
	const [computerBrand, setComputerBrand] = useState('');
	const [series, setSeries] = useState('');

	// Fashion-specific fields
	const [material, setMaterial] = useState('');
	const [fashionBrand, setFashionBrand] = useState('');
	const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
	const [season, setSeason] = useState('');

	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		loadCategories();
	}, []);

	const loadCategories = async () => {
		try {
			const response = await categoryService.getAllCategories();
			if (response.isSuccess && response.data.length > 0) {
				setCategories(response.data);
				setCategoryId(response.data[0].id.toString());
			}
		} catch (err: unknown) {
			console.error('Failed to load categories:', err);
			setError('Failed to load categories');
		} finally {
			setLoading(false);
		}
	};

	const handleSelectCategory = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		// Just save the selected category and move to step 2
		const catId = Number(categoryId);
		setSelectedCategoryId(catId);
		setStep(2);
	};

	const handleAddDetails = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			// Build details object based on category
			let details: ProductDetails;

			if (selectedCategoryId === 1) {
				// Computers
				details = {
					category: 'Computers',
					capacity,
					capacityUnit,
					capacityType,
					brand: computerBrand,
					series,
				} as ComputerDetails;
			} else if (selectedCategoryId === 2) {
				// Fashion
				details = {
					category: 'Fashion',
					material,
					brand: fashionBrand,
					size,
					season,
				} as FashionDetails;
			} else {
				// Fallback (should not happen)
				setError('Invalid category selected');
				setLoading(false);
				return;
			}

			// Create product with ALL data in a single request
			const createResponse = await productService.createProduct({
				categoryId: selectedCategoryId,
				title,
				code,
				description,
				variationType,
				about: about.filter((item) => item.trim() !== ''),
				details,
			});

			if (!createResponse.isSuccess) {
				setError('Failed to create product');
				setLoading(false);
				return;
			}

			setProductId(createResponse.data.id);
			setSuccess('Product created successfully!');
			setLoading(false);
			setStep(3);
		} catch (err: unknown) {
			setLoading(false);
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				setError(axiosError.response?.data?.message || 'Failed to create product');
			} else {
				setError('Failed to create product');
			}
		}
	};

	const handleActivateProduct = async () => {
		if (!productId) return;

		try {
			await productService.activateProduct(productId);
			alert('Product activated successfully!');
			navigate('/products');
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				setError(axiosError.response?.data?.message || 'Failed to activate product');
			} else {
				setError('Failed to activate product');
			}
		}
	};

	const handleContinueWithoutActivating = () => {
		// Product remains inactive, redirect to products list
		navigate('/products');
	};

	// Validate if all required fields are filled
	const isFormValid = (): boolean => {
		// Common required fields
		if (!title.trim() || !code.trim() || !description.trim()) {
			return false;
		}

		// At least one about item must have content
		const hasValidAbout = about.some((item) => item.trim() !== '');
		if (!hasValidAbout) {
			return false;
		}

		// Category-specific validations
		if (selectedCategoryId === 1) {
			// Computers: brand, series, capacity required
			if (!computerBrand.trim() || !series.trim() || !capacity || capacity <= 0) {
				return false;
			}
		} else if (selectedCategoryId === 2) {
			// Fashion: material, fashionBrand, season required
			if (!material.trim() || !fashionBrand.trim() || !season.trim()) {
				return false;
			}
		}

		return true;
	};

	return (
		<div className='create-product-container'>
			<h2>Create Product</h2>

			{loading ? (
				<div className='loading'>Loading categories...</div>
			) : (
				<>
					{step === 1 && (
						<form
							onSubmit={handleSelectCategory}
							className='product-form'
						>
							<div className='form-group'>
								<label>Category</label>
								<select
									value={categoryId}
									onChange={(e) => setCategoryId(e.target.value)}
									required
								>
									{categories.map((category) => (
										<option
											key={category.id}
											value={category.id}
										>
											{category.name}
										</option>
									))}
								</select>
							</div>

							{error && <div className='error-message'>{error}</div>}
							{success && <div className='success-message'>{success}</div>}

							<button
								type='submit'
								className='submit-button'
							>
								Continue
							</button>
						</form>
					)}

					{step === 2 && (
						<form
							onSubmit={handleAddDetails}
							className='product-form'
						>
							<div className='form-group'>
								<label>Title *</label>
								<input
									type='text'
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>

							<div className='form-group'>
								<label>Code *</label>
								<input
									type='text'
									value={code}
									onChange={(e) => setCode(e.target.value)}
									required
								/>
							</div>

							<div className='form-group'>
								<label>Description *</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
									required
								/>
							</div>

							<div className='form-group'>
								<label>Variation Type *</label>
								<select
									value={variationType}
									onChange={(e) => setVariationType(e.target.value)}
									required
								>
									<option value='NONE'>No Variation</option>
									<option value='OnlySize'>Size Only</option>
									<option value='OnlyColor'>Color Only</option>
									<option value='SizeAndColor'>Size and Color</option>
								</select>
							</div>

							{/* Category-specific fields */}
							{selectedCategoryId === 1 && (
								<>
									<h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#2d3748' }}>Computer Details</h3>

									<div className='form-group'>
										<label>Brand *</label>
										<input
											type='text'
											value={computerBrand}
											onChange={(e) => setComputerBrand(e.target.value)}
											placeholder='e.g., Dell, HP, Apple'
											required
										/>
									</div>

									<div className='form-group'>
										<label>Series *</label>
										<input
											type='text'
											value={series}
											onChange={(e) => setSeries(e.target.value)}
											placeholder='e.g., XPS, Pavilion, MacBook'
											required
										/>
									</div>

									<div className='form-row'>
										<div className='form-group'>
											<label>Capacity *</label>
											<input
												type='number'
												value={capacity}
												onChange={(e) => setCapacity(Number(e.target.value))}
												min='1'
												required
											/>
										</div>

										<div className='form-group'>
											<label>Unit *</label>
											<select
												value={capacityUnit}
												onChange={(e) => setCapacityUnit(e.target.value as 'GB' | 'TB')}
												required
											>
												<option value='GB'>GB</option>
												<option value='TB'>TB</option>
											</select>
										</div>

										<div className='form-group'>
											<label>Type *</label>
											<select
												value={capacityType}
												onChange={(e) => setCapacityType(e.target.value as 'SSD' | 'HD')}
												required
											>
												<option value='SSD'>SSD</option>
												<option value='HD'>HD</option>
											</select>
										</div>
									</div>
								</>
							)}

							{selectedCategoryId === 2 && (
								<>
									<h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#2d3748' }}>Fashion Details</h3>

									<div className='form-group'>
										<label>Material *</label>
										<input
											type='text'
											value={material}
											onChange={(e) => setMaterial(e.target.value)}
											placeholder='e.g., Cotton, Polyester, Leather'
											required
										/>
									</div>

									<div className='form-group'>
										<label>Brand *</label>
										<input
											type='text'
											value={fashionBrand}
											onChange={(e) => setFashionBrand(e.target.value)}
											placeholder='e.g., Nike, Adidas, Zara'
											required
										/>
									</div>

									<div className='form-row'>
										<div className='form-group'>
											<label>Size *</label>
											<select
												value={size}
												onChange={(e) => setSize(e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')}
												required
											>
												<option value='XS'>XS</option>
												<option value='S'>S</option>
												<option value='M'>M</option>
												<option value='L'>L</option>
												<option value='XL'>XL</option>
												<option value='XXL'>XXL</option>
											</select>
										</div>

										<div className='form-group'>
											<label>Season *</label>
											<input
												type='text'
												value={season}
												onChange={(e) => setSeason(e.target.value)}
												placeholder='e.g., Spring/Summer 2026'
												required
											/>
										</div>
									</div>
								</>
							)}

							<div className='form-group'>
								<label>About (at least one required) *</label>
								{about.map((item, index) => (
									<div
										key={index}
										style={{ marginBottom: '8px' }}
									>
										<input
											type='text'
											value={item}
											onChange={(e) => {
												const newAbout = [...about];
												newAbout[index] = e.target.value;
												setAbout(newAbout);
											}}
											placeholder={`Point ${index + 1}`}
										/>
									</div>
								))}
								<button
									type='button'
									className='back-button'
									onClick={() => setAbout([...about, ''])}
									style={{ marginTop: '8px' }}
								>
									+ Add Point
								</button>
							</div>

							{error && <div className='error-message'>{error}</div>}
							{success && <div className='success-message'>{success}</div>}

							<div className='button-group'>
								<button
									type='button'
									className='back-button'
									onClick={() => setStep(1)}
									disabled={loading}
								>
									Volver
								</button>
								<button
									type='submit'
									className='submit-button'
									disabled={loading || !isFormValid()}
								>
									{loading ? 'Creating...' : 'Create Product'}
								</button>
							</div>
						</form>
					)}

					{step === 3 && (
						<div className='activation-step'>
							<p className='success-message'>Product created successfully!</p>
							<p style={{ color: '#4a5568', marginBottom: '20px' }}>
								Do you want to activate the product now or continue without activating?
							</p>
							<div className='button-group'>
								<button
									type='button'
									className='back-button'
									onClick={handleContinueWithoutActivating}
								>
									Continue without activating
								</button>
								<button
									onClick={handleActivateProduct}
									className='activate-button'
								>
									Activate product
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CreateProduct;
