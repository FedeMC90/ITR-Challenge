import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	registerUser: (userId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export { SocketContext };

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		// Create socket connection
		const newSocket = io(SOCKET_URL, {
			transports: ['websocket', 'polling'],
			autoConnect: true,
		});

		newSocket.on('connect', () => {
			console.log('✅ WebSocket connected:', newSocket.id);
			setIsConnected(true);
		});

		newSocket.on('disconnect', (reason) => {
			console.log('❌ WebSocket disconnected:', reason);
			setIsConnected(false);
		});

		newSocket.on('connect_error', (error) => {
			console.error('WebSocket connection error:', error);
			setIsConnected(false);
		});

		// Set socket instance (intentional effect for initialization)
		// eslint-disable-next-line
		setSocket(newSocket);

		// Cleanup on unmount
		return () => {
			newSocket.close();
		};
	}, []);

	const registerUser = useCallback(
		(userId: number) => {
			if (socket && isConnected) {
				console.log('📝 Registering user:', userId);
				socket.emit('register', userId);
			}
		},
		[socket, isConnected],
	);

	return <SocketContext.Provider value={{ socket, isConnected, registerUser }}>{children}</SocketContext.Provider>;
};
