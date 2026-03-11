import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import CreateOrder from './components/CreateOrder';
import OrderList from './components/OrderList';
import ManageRoles from './components/ManageRoles';
import './App.css';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div className='app'>
					<Navbar />
					<main className='main-content'>
						<Routes>
							<Route
								path='/login'
								element={<Login />}
							/>

							<Route
								path='/products'
								element={
									<ProtectedRoute>
										<ProductList />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/create-product'
								element={
									<ProtectedRoute>
										<CreateProduct />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/create-order'
								element={
									<ProtectedRoute>
										<CreateOrder />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/orders'
								element={
									<ProtectedRoute>
										<OrderList />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/manage-roles'
								element={
									<ProtectedRoute requireAdmin>
										<ManageRoles />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/'
								element={
									<Navigate
										to='/products'
										replace
									/>
								}
							/>
							<Route
								path='*'
								element={
									<Navigate
										to='/products'
										replace
									/>
								}
							/>
						</Routes>
					</main>
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
};

export default App;
