import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import './CreateProduct.css';

const CreateProduct: React.FC = () => {
	const [categoryId, setCategoryId] = useState('1');
	const [productId, setProductId] = useState<number | null>(null);
	const [title, setTitle] = useState('');
	const [code, setCode] = useState('');
	const [description, setDescription] = useState('');
	const [variationType, setVariationType] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [step, setStep] = useState(1);

	const navigate = useNavigate();

	const handleCreateProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		try {
			const response = await productService.createProduct(Number(categoryId));
			if (response.isSuccess) {
				setProductId(response.data.id);
				setSuccess('Product created! Now add details.');
				setStep(2);
			}
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				setError(axiosError.response?.data?.message || 'Failed to create product');
			} else {
				setError('Failed to create product');
			}
		}
	};

	const handleAddDetails = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!productId) return;

		try {
			await productService.addProductDetails(productId, {
				title,
				code,
				description,
				variationType,
				about: [],
				details: {},
			});
			setSuccess('Details added!');
			setStep(3);
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				setError(axiosError.response?.data?.message || 'Failed to add details');
			} else {
				setError('Failed to add details');
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

	return (
		<div className='create-product-container'>
			<h2>Create Product</h2>

			{step === 1 && (
				<form
					onSubmit={handleCreateProduct}
					className='product-form'
				>
					<div className='form-group'>
						<label>Category ID</label>
						<input
							type='number'
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
							required
						/>
					</div>

					{error && <div className='error-message'>{error}</div>}
					{success && <div className='success-message'>{success}</div>}

					<button
						type='submit'
						className='submit-button'
					>
						Create Product
					</button>
				</form>
			)}

			{step === 2 && (
				<form
					onSubmit={handleAddDetails}
					className='product-form'
				>
					<div className='form-group'>
						<label>Title</label>
						<input
							type='text'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Code</label>
						<input
							type='text'
							value={code}
							onChange={(e) => setCode(e.target.value)}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={4}
						/>
					</div>

					<div className='form-group'>
						<label>Variation Type</label>
						<input
							type='text'
							value={variationType}
							onChange={(e) => setVariationType(e.target.value)}
						/>
					</div>

					{error && <div className='error-message'>{error}</div>}
					{success && <div className='success-message'>{success}</div>}

					<button
						type='submit'
						className='submit-button'
					>
						Add Details
					</button>
				</form>
			)}

			{step === 3 && (
				<div className='activation-step'>
					<p className='success-message'>Product details added successfully!</p>
					<button
						onClick={handleActivateProduct}
						className='activate-button'
					>
						Activate Product
					</button>
				</div>
			)}
		</div>
	);
};

export default CreateProduct;
