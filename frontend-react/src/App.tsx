import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SocketRegistration } from './components/SocketRegistration/SocketRegistration';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Login/Login';
import ProductList from './components/ProductList/ProductList';
import CreateProduct from './components/CreateProduct/CreateProduct';
import CreateOrder from './components/CreateOrder/CreateOrder';
import OrderList from './components/OrderList/OrderList';
import ManageRoles from './components/ManageRoles/ManageRoles';
import './App.css';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<SocketProvider>
				<SocketRegistration />
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
			</SocketProvider>
		</AuthProvider>
	);
};

export default App;
