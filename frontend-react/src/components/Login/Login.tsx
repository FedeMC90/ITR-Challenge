import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showRegisterModal, setShowRegisterModal] = useState(false);
	const [regEmail, setRegEmail] = useState('');
	const [regPassword, setRegPassword] = useState('');
	const [regError, setRegError] = useState('');
	const [regSuccess, setRegSuccess] = useState('');

	const { login, register } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const response = await login({ email, password });
			if (response.isSuccess) {
				navigate('/products');
			} else {
				setError(response.message || 'Login failed');
			}
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				setError(axiosError.response?.data?.message || 'Error connecting to server');
			} else {
				setError('Error connecting to server');
			}
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setRegError('');
		setRegSuccess('');

		if (!regEmail || !regPassword) {
			setRegError('Email and password are required');
			return;
		}

		if (regPassword.length < 8) {
			setRegError('Password must be at least 8 characters');
			return;
		}

		try {
			const response = await register({ email: regEmail, password: regPassword });
			if (response.isSuccess) {
				setRegSuccess('User registered successfully! You can now login.');
				setTimeout(() => {
					closeRegisterModal();
				}, 2000);
			} else {
				setRegError(response.message || 'Registration failed');
			}
		} catch (err: unknown) {
			let errorMsg = 'Error connecting to server';
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				errorMsg = axiosError.response?.data?.message || 'Error connecting to server';
			}
			setRegError(errorMsg);
		}
	};

	const closeRegisterModal = () => {
		setShowRegisterModal(false);
		setRegEmail('');
		setRegPassword('');
		setRegError('');
		setRegSuccess('');
	};

	return (
		<div className='login-container'>
			<div className='login-box'>
				<h2>Login</h2>
				<form onSubmit={handleLogin}>
					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder='Enter your email'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder='Enter your password'
						/>
					</div>

					{error && <div className='error-message'>{error}</div>}

					<button
						type='submit'
						className='login-button'
					>
						Login
					</button>
				</form>

				<button
					type='button'
					className='register-button'
					onClick={() => setShowRegisterModal(true)}
				>
					Register
				</button>
			</div>

			{/* Register Modal */}
			{showRegisterModal && (
				<div
					className='modal-overlay'
					onClick={closeRegisterModal}
				>
					<div
						className='modal-content'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='modal-header'>
							<h3>Create New User</h3>
							<button
								className='modal-close'
								onClick={closeRegisterModal}
							>
								×
							</button>
						</div>

						<form onSubmit={handleRegister}>
							<div className='form-group'>
								<label htmlFor='reg-email'>Email</label>
								<input
									id='reg-email'
									type='email'
									value={regEmail}
									onChange={(e) => setRegEmail(e.target.value)}
									required
									placeholder='Enter email'
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='reg-password'>Password</label>
								<input
									id='reg-password'
									type='password'
									value={regPassword}
									onChange={(e) => setRegPassword(e.target.value)}
									required
									placeholder='Enter password (min 8 characters)'
								/>
							</div>

							{regError && <div className='error-message'>{regError}</div>}
							{regSuccess && <div className='success-message'>{regSuccess}</div>}

							<div className='modal-actions'>
								<button
									type='button'
									onClick={closeRegisterModal}
									className='cancel-button'
								>
									Cancel
								</button>
								<button
									type='submit'
									className='submit-button'
								>
									Create User
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Login;
