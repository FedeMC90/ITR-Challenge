import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar: React.FC = () => {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
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
				<li>
					<Link to='/create-product'>Create Product</Link>
				</li>
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
				<span className='user-email'>{user?.email}</span>
				<button
					onClick={handleLogout}
					className='logout-button'
				>
					Logout
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
