import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

/**
 * Component that automatically registers the authenticated user with the WebSocket
 * This enables receiving personalized notifications (order updates, etc.)
 */
export const SocketRegistration: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const { registerUser, isConnected } = useSocket();

	useEffect(() => {
		if (isAuthenticated && user?.id && isConnected) {
			registerUser(user.id);
		}
	}, [isAuthenticated, user?.id, isConnected, registerUser]);

	return null; // This component doesn't render anything
};
