import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import type { User } from '../types';
import './Navbar.css';

const Navbar: React.FC = () => {
	const { user, isAuthenticated, logout, isAdmin, canCreateProducts } = useAuth();
	const navigate = useNavigate();
	const [showUserModal, setShowUserModal] = useState(false);
	const [userDetails, setUserDetails] = useState<User | null>(null);
	const [loadingUserDetails, setLoadingUserDetails] = useState(false);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const handleOpenUserModal = async () => {
		try {
			setLoadingUserDetails(true);
			setShowUserModal(true);
			const profileData = await userService.getUserProfile();
			setUserDetails(profileData);
		} catch (err) {
			console.error('Failed to load user profile:', err);
			alert('Failed to load user profile');
			setShowUserModal(false);
		} finally {
			setLoadingUserDetails(false);
		}
	};

	const handleCloseUserModal = () => {
		setShowUserModal(false);
		setUserDetails(null);
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<nav className='navbar'>
			<div className='navbar-brand'>
				<Link to='/products'>E-Commerce</Link>
			</div>

			<ul className='navbar-menu'>
				<li>
					<Link to='/products'>Products</Link>
				</li>
				{canCreateProducts() && (
					<li>
						<Link to='/create-product'>Create Product</Link>
					</li>
				)}
				<li>
					<Link to='/create-order'>Create Order</Link>
				</li>
				<li>
					<Link to='/orders'>My Orders</Link>
				</li>
				{isAdmin() && (
					<li>
						<Link to='/manage-roles'>Manage Roles</Link>
					</li>
				)}
			</ul>

			<div className='navbar-user'>
				<span
					className='user-email'
					onClick={handleOpenUserModal}
				>
					{user?.email}
				</span>
				<button
					onClick={handleLogout}
					className='logout-button'
				>
					Logout
				</button>
			</div>

			{/* User Profile Modal */}
			{showUserModal && (
				<div
					className='user-modal-overlay'
					onClick={handleCloseUserModal}
				>
					<div
						className='user-modal-content'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='user-modal-header'>
							<h2>User Profile</h2>
							<button
								className='user-modal-close'
								onClick={handleCloseUserModal}
							>
								✕
							</button>
						</div>

						{loadingUserDetails ? (
							<div className='user-modal-loading'>Loading profile...</div>
						) : userDetails ? (
							<div className='user-modal-body'>
								<div className='user-info-section'>
									<div className='user-info-item'>
										<strong>User ID:</strong>
										<span>{userDetails.id}</span>
									</div>
									<div className='user-info-item'>
										<strong>Email:</strong>
										<span>{userDetails.email}</span>
									</div>
									{userDetails.firstName && (
										<div className='user-info-item'>
											<strong>First Name:</strong>
											<span>{userDetails.firstName}</span>
										</div>
									)}
									{userDetails.lastName && (
										<div className='user-info-item'>
											<strong>Last Name:</strong>
											<span>{userDetails.lastName}</span>
										</div>
									)}
									<div className='user-info-item'>
										<strong>Roles:</strong>
										<div className='user-roles'>
											{userDetails.roles && userDetails.roles.length > 0 ? (
												userDetails.roles.map((role) => (
													<span
														key={role.id}
														className='role-badge'
													>
														{role.name}
													</span>
												))
											) : (
												<span>No roles assigned</span>
											)}
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className='user-modal-error'>Failed to load profile</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
