import {useAuthStore} from '../stores/authStore';
import {storage} from './storage';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const payload = {
	method: '',
	headers: {},
};

export const api = {
	async get(endpoint) {
		const authStore = useAuthStore();
		const token = authStore.getToken;

		if (!token) {
			throw new Error('Token inválido');
		}

		payload.method = 'GET';
		payload.headers = {
			Authorization: `Bearer ${token}`,
		};

		try {
			const body = await fetch(`${BASE_URL}/${endpoint}`, payload);
			const response = await body.json();
			console.log('response: ', response);
			if (response.error) {
				console.error(
					'Erro ao realizar parsear get request: ',
					response.error,
				);
				return null;
			}
			return response;
		} catch (error) {
			console.error('Erro ao realizar get request: ', response.error);
			return null;
		}
	},
};
