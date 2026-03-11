import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import type { User, Role } from '../types';
import './ManageRoles.css';

const ManageRoles: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const [usersData, rolesData] = await Promise.all([userService.getAllUsers(), roleService.getAllRoles()]);
			setUsers(usersData);
			setRoles(rolesData);
			setError('');
			return usersData; // Return the updated users
		} catch (err: unknown) {
			setError('Failed to load data');
			console.error('Failed to load data:', err);
			return []; // Return empty array on error
		} finally {
			setLoading(false);
		}
	};

	const toggleRole = async (roleId: number) => {
		if (!selectedUser) return;

		const hasRole = selectedUser.roles.some((r) => r.id === roleId);

		try {
			if (hasRole) {
				await roleService.removeRole({ userId: selectedUser.id, roleId });
			} else {
				await roleService.assignRole({ userId: selectedUser.id, roleId });
			}

			// Reload data after successful toggle and get updated users
			const updatedUsers = await loadData();

			// Update selected user with new data from the fresh data
			const updatedUser = updatedUsers.find((u) => u.id === selectedUser.id);
			if (updatedUser) {
				setSelectedUser(updatedUser);
			}
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as { response?: { data?: { message?: string } } };
				alert(axiosError.response?.data?.message || 'Failed to toggle role');
			} else {
				alert('Failed to toggle role');
			}
		}
	};

	const hasRole = (roleId: number): boolean => {
		if (!selectedUser) return false;
		return selectedUser.roles.some((r) => r.id === roleId);
	};

	if (loading) {
		return <div className='loading'>Loading...</div>;
	}

	if (error) {
		return <div className='error'>{error}</div>;
	}

	return (
		<div className='manage-roles-container'>
			<h2>Manage User Roles</h2>

			<div className='roles-layout'>
				<div className='users-panel'>
					<h3>Users</h3>
					<div className='users-list'>
						{users.map((user) => (
							<div
								key={user.id}
								className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
								onClick={() => setSelectedUser(user)}
							>
								<div>
									<strong>{user.email}</strong>
									<div className='user-roles'>
										{user.roles.map((role) => (
											<span
												key={role.id}
												className='role-badge'
											>
												{role.name}
											</span>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='roles-panel'>
					{selectedUser ? (
						<>
							<h3>Roles for {selectedUser.email}</h3>
							<div className='roles-grid'>
								{roles.map((role) => (
									<div
										key={role.id}
										className='role-card'
									>
										<div className='role-info'>
											<strong>{role.name}</strong>
											<span className={hasRole(role.id) ? 'assigned' : 'not-assigned'}>
												{hasRole(role.id) ? '✓ Assigned' : '✗ Not Assigned'}
											</span>
										</div>
										<button
											onClick={() => toggleRole(role.id)}
											className={hasRole(role.id) ? 'remove-btn' : 'assign-btn'}
										>
											{hasRole(role.id) ? 'Remove' : 'Assign'}
										</button>
									</div>
								))}
							</div>
						</>
					) : (
						<div className='select-user-message'>
							<p>Select a user to manage their roles</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ManageRoles;
