import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { productVariationService } from '../../services/productVariationService';
import { categoryService } from '../../services/categoryService';
import { colorService } from '../../services/colorService';
import { sizeService } from '../../services/sizeService';
import type {
	Category,
	Color,
	ComputerDetails,
	FashionDetails,
	ProductDetails,
	Size,
	VariationItem,
} from '../../types';
import './CreateProduct.css';

const CreateProduct: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [colors, setColors] = useState<Color[]>([]);
	const [sizes, setSizes] = useState<Size[]>([]);
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
	const [season, setSeason] = useState('');

	// Variation fields (integrated in Step 2)
	const [variations, setVariations] = useState<VariationItem[]>([{ colorName: '', sizeCode: '', price: 0 }]);
	const [basePrice, setBasePrice] = useState<number>(0);
	const [currencyCode, setCurrencyCode] = useState('USD');
	const [countryCode, setCountryCode] = useState('US');

	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			const [categoriesResponse, colorsData, sizesData] = await Promise.all([
				categoryService.getAllCategories(),
				colorService.getAllColors(),
				sizeService.getAllSizes(),
			]);

			if (categoriesResponse.isSuccess && categoriesResponse.data.length > 0) {
				setCategories(categoriesResponse.data);
				setCategoryId(categoriesResponse.data[0].id.toString());
			}

			// Ensure colors and sizes are always arrays
			setColors(Array.isArray(colorsData) ? colorsData : []);
			setSizes(Array.isArray(sizesData) ? sizesData : []);
		} catch (err: unknown) {
			console.error('Failed to load initial data:', err);
			setError('Failed to load initial data');
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

		// Validate form
		if (!isFormValid()) {
			setError('Please fill all required fields');
			setLoading(false);
			return;
		}

		// Validate variations based on variationType (only if not NONE)
		if (variationType !== 'NONE') {
			const validVariations = variations.filter((v) => {
				const hasValidFields =
					(variationType === 'OnlyColor' && v.colorName.trim() !== '') ||
					(variationType === 'OnlySize' && v.sizeCode.trim() !== '') ||
					(variationType === 'SizeAndColor' && v.colorName.trim() !== '' && v.sizeCode.trim() !== '');
				const hasValidPrice = (v.price ?? 0) > 0;
				return hasValidFields && hasValidPrice;
			});

			if (validVariations.length === 0) {
				setError('Please add at least one variation with a valid price');
				setLoading(false);
				return;
			}
		}

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
					season,
				} as FashionDetails;
			} else {
				setError('Invalid category selected');
				setLoading(false);
				return;
			}

			// Create product
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

			const newProductId = createResponse.data.id;
			setProductId(newProductId);

			// Create variations if variationType is not NONE
			if (variationType !== 'NONE') {
				// Normalize variations based on variationType and include individual prices
				const normalizedVariations = variations
					.map((v) => {
						if (variationType === 'OnlyColor') {
							return { colorName: v.colorName, sizeCode: 'NA', price: v.price };
						} else if (variationType === 'OnlySize') {
							return { colorName: 'NA', sizeCode: v.sizeCode, price: v.price };
						} else {
							return { colorName: v.colorName, sizeCode: v.sizeCode, price: v.price };
						}
					})
					.filter((v) => v.colorName && v.sizeCode && (v.price ?? 0) > 0);

				await productVariationService.createVariations(newProductId, {
					variations: normalizedVariations,
					basePrice: 0, // Not used when individual prices are set
					currencyCode,
					countryCode,
				});
			} else {
				// For NONE type, create a single default variation with the specified price
				await productVariationService.createVariations(newProductId, {
					variations: [{ colorName: 'NA', sizeCode: 'NA' }],
					basePrice,
					currencyCode,
					countryCode,
				});
			}

			setSuccess('Product and variations created successfully!');
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

	// Handle variation type change - reset variations accordingly
	const handleVariationTypeChange = (newType: string) => {
		setVariationType(newType);
		// Reset variations when changing type
		if (newType === 'NONE') {
			setVariations([{ colorName: 'NA', sizeCode: 'NA' }]);
		} else if (newType === 'OnlyColor') {
			setVariations([{ colorName: '', sizeCode: 'NA', price: 0 }]);
		} else if (newType === 'OnlySize') {
			setVariations([{ colorName: 'NA', sizeCode: '', price: 0 }]);
		} else if (newType === 'SizeAndColor') {
			setVariations([{ colorName: '', sizeCode: '', price: 0 }]);
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

		// Price validation
		if (variationType === 'NONE') {
			// For NONE type, basePrice is required
			if (basePrice <= 0) {
				return false;
			}
		} else {
			// For variations, check if at least one variation is properly filled with price
			const hasValidVariation = variations.some((v) => {
				const hasValidFields =
					(variationType === 'OnlyColor' && v.colorName.trim() !== '') ||
					(variationType === 'OnlySize' && v.sizeCode.trim() !== '') ||
					(variationType === 'SizeAndColor' && v.colorName.trim() !== '' && v.sizeCode.trim() !== '');
				const hasValidPrice = (v.price ?? 0) > 0;
				return hasValidFields && hasValidPrice;
			});

			if (!hasValidVariation) {
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
									onChange={(e) => handleVariationTypeChange(e.target.value)}
									required
								>
									<option value='NONE'>No Variation</option>
									<option value='OnlySize'>Size Only</option>
									<option value='OnlyColor'>Color Only</option>
									<option value='SizeAndColor'>Size and Color</option>
								</select>
							</div>

							{/* Pricing Section - shown only when variationType is NONE */}
							{variationType === 'NONE' && (
								<>
									<h3
										style={{
											marginTop: '25px',
											marginBottom: '15px',
											color: '#2d3748',
											borderTop: '2px solid #e2e8f0',
											paddingTop: '20px',
										}}
									>
										Product Pricing
									</h3>

									<div className='form-row'>
										<div className='form-group'>
											<label>Base Price *</label>
											<input
												type='text'
												value={basePrice === 0 ? '' : basePrice}
												onChange={(e) => {
													const value = e.target.value;
													// Allow only numbers and single decimal point
													if (value === '' || /^\d*\.?\d*$/.test(value)) {
														setBasePrice(value === '' ? 0 : Number(value));
													}
												}}
												placeholder='e.g., 99.99'
												required
											/>
										</div>

										<div className='form-group'>
											<label>Currency *</label>
											<select
												value={currencyCode}
												onChange={(e) => setCurrencyCode(e.target.value)}
												required
											>
												<option value='USD'>USD</option>
												<option value='EUR'>EUR</option>
												<option value='ARS'>ARS</option>
												<option value='EGP'>EGP</option>
											</select>
										</div>

										<div className='form-group'>
											<label>Country *</label>
											<select
												value={countryCode}
												onChange={(e) => setCountryCode(e.target.value)}
												required
											>
												<option value='US'>United States</option>
												<option value='ES'>Spain</option>
												<option value='AR'>Argentina</option>
												<option value='EG'>Egypt</option>
											</select>
										</div>
									</div>
								</>
							)}

							{/* Global Currency and Country selection for variations */}
							{variationType !== 'NONE' && (
								<>
									<h3
										style={{
											marginTop: '25px',
											marginBottom: '15px',
											color: '#2d3748',
											borderTop: '2px solid #e2e8f0',
											paddingTop: '20px',
										}}
									>
										Pricing Configuration
									</h3>
									<div className='form-row'>
										<div className='form-group'>
											<label>Currency *</label>
											<select
												value={currencyCode}
												onChange={(e) => setCurrencyCode(e.target.value)}
												required
											>
												<option value='USD'>USD</option>
												<option value='EUR'>EUR</option>
												<option value='ARS'>ARS</option>
												<option value='EGP'>EGP</option>
											</select>
										</div>

										<div className='form-group'>
											<label>Country *</label>
											<select
												value={countryCode}
												onChange={(e) => setCountryCode(e.target.value)}
												required
											>
												<option value='US'>United States</option>
												<option value='ES'>Spain</option>
												<option value='AR'>Argentina</option>
												<option value='EG'>Egypt</option>
											</select>
										</div>
									</div>

									{/* Variation Configuration Section */}
									<h3 style={{ marginTop: '25px', marginBottom: '15px', color: '#2d3748' }}>Product Variations</h3>

									<div className='form-group'>
										<label>Variations (at least one required) *</label>
										<p style={{ fontSize: '13px', color: '#718096', marginBottom: '10px' }}>
											{variationType === 'OnlyColor' && 'Add different color options for this product'}
											{variationType === 'OnlySize' && 'Add different size options for this product'}
											{variationType === 'SizeAndColor' && 'Add color and size combinations for this product'}
										</p>
										{variations.map((variation, index) => (
											<div
												key={index}
												className='variation-row'
												style={{ marginBottom: '15px' }}
											>
												<div style={{ display: 'flex', gap: '10px' }}>
													{(variationType === 'OnlyColor' || variationType === 'SizeAndColor') && (
														<div style={{ flex: 1 }}>
															<label
																style={{
																	fontSize: '13px',
																	color: '#4a5568',
																	marginBottom: '4px',
																	display: 'block',
																}}
															>
																Color
															</label>
															<select
																value={variation.colorName}
																onChange={(e) => {
																	const newVariations = [...variations];
																	newVariations[index].colorName = e.target.value;
																	setVariations(newVariations);
																}}
																required
																style={{ width: '100%' }}
															>
																<option value=''>Select a color</option>
																{Array.isArray(colors) &&
																	colors
																		.filter((color) => color.name !== 'NA')
																		.map((color) => (
																			<option
																				key={color.name}
																				value={color.name}
																			>
																				{color.name.charAt(0).toUpperCase() + color.name.slice(1)}
																			</option>
																		))}
															</select>
														</div>
													)}
													{(variationType === 'OnlySize' || variationType === 'SizeAndColor') && (
														<div style={{ flex: 1 }}>
															<label
																style={{
																	fontSize: '13px',
																	color: '#4a5568',
																	marginBottom: '4px',
																	display: 'block',
																}}
															>
																Size
															</label>
															<select
																value={variation.sizeCode}
																onChange={(e) => {
																	const newVariations = [...variations];
																	newVariations[index].sizeCode = e.target.value;
																	setVariations(newVariations);
																}}
																required
																style={{ width: '100%' }}
															>
																<option value=''>Select a size</option>
																{Array.isArray(sizes) &&
																	sizes
																		.filter((size) => size.code !== 'NA')
																		.map((size) => (
																			<option
																				key={size.code}
																				value={size.code}
																			>
																				{size.code}
																			</option>
																		))}
															</select>
														</div>
													)}
													<div style={{ flex: 1 }}>
														<label
															style={{
																fontSize: '13px',
																color: '#4a5568',
																marginBottom: '4px',
																display: 'block',
															}}
														>
															Price *
														</label>
														<input
															type='text'
															value={(variation.price ?? 0) === 0 ? '' : variation.price}
															onChange={(e) => {
																const value = e.target.value;
																if (value === '' || /^\d*\.?\d*$/.test(value)) {
																	const newVariations = [...variations];
																	newVariations[index].price = value === '' ? 0 : Number(value);
																	setVariations(newVariations);
																}
															}}
															placeholder='e.g., 99.99'
															required
															style={{ width: '100%' }}
														/>
													</div>
													{variations.length > 1 && (
														<div style={{ display: 'flex', alignItems: 'flex-end' }}>
															<button
																type='button'
																onClick={() => setVariations(variations.filter((_, i) => i !== index))}
																className='back-button'
																style={{ minWidth: '80px' }}
															>
																Remove
															</button>
														</div>
													)}
												</div>
											</div>
										))}
										<button
											type='button'
											className='back-button'
											onClick={() => {
												if (variationType === 'OnlyColor') {
													setVariations([...variations, { colorName: '', sizeCode: 'NA', price: 0 }]);
												} else if (variationType === 'OnlySize') {
													setVariations([...variations, { colorName: 'NA', sizeCode: '', price: 0 }]);
												} else {
													setVariations([...variations, { colorName: '', sizeCode: '', price: 0 }]);
												}
											}}
											style={{ marginTop: '8px' }}
										>
											+ Add Variation
										</button>
									</div>
								</>
							)}

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
								>
									Back
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
