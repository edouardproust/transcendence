import axios from 'axios'
import { useAuthStore } from '../stores/auth'

export const http = axios.create({
	baseURL: '/api',
	timeout: 15000,
	withCredentials: true,
})

http.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})
