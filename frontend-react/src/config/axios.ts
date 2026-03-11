import axios from 'axios';

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token expired or invalid - clear storage and redirect to login
			localStorage.removeItem('access_token');
			localStorage.removeItem('user_data');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	},
);

export default apiClient;
