import {storage} from '../services/storage';
import {useAuthStore} from '../stores/authStore';

const generateRandomString = length => {
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const base64encode = input => {
	return btoa(String.fromCharCode(...new Uint8Array(input)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

const sha256 = async plain => {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return window.crypto.subtle.digest('SHA-256', data);
};

const getUserData = async token => {
	const request = await fetch(import.meta.env.VITE_BASE_URL + '/me', {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
	const response = await request.json();
	return {
		id: response.id,
		display_name: response.display_name,
		email: response.email,
		followers: response.followers,
		images: response.images,
		uri: response.uri,
	};
};

const saveSession = async authResponse => {
	const authStore = useAuthStore();
	const {access_token, refresh_token, expires_in} = authResponse;

	if (!access_token) {
		throw new Error('Token de acesso inválido');
	}

	const now = new Date();
	const expiry = new Date(now.getTime() + expires_in * 1000);
	const user = await getUserData(access_token);

	const session = {
		access_token,
		refresh_token,
		expires_in,
		expiry,
		user,
	};

	await storage.setActiveSession(session);
	authStore.session = session;

	return session;
};

export const isTokenExpired = expires => {
	const expireDate = new Date(expires);
	const now = new Date();

	const fiveMinutes = 5 * 60 * 1000;
	return expireDate.getTime() - now.getTime() < fiveMinutes;
};

export const refreshToken = async refresh_token => {
	const url = import.meta.env.VITE_TOKEN_ENDPOINT;
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_CLIENT_ID,
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		}),
	};

	try {
		const body = await fetch(url, payload);
		const response = await body.json();

		if (response.error) {
			console.error('Erro ao renovar token: ', response.error);
			return false;
		}

		await saveSession(response);
		return true;
	} catch (error) {
		console.error('Erro ao renovar token: ', error);
		return false;
	}
};

export const getToken = async code => {
	const verifier = localStorage.getItem('verifier');
	const url = import.meta.env.VITE_TOKEN_ENDPOINT;
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_CLIENT_ID,
			grant_type: 'authorization_code',
			code,
			redirect_uri: import.meta.env.VITE_REDIRECT_URL,
			code_verifier: verifier,
		}),
	};

	try {
		const body = await fetch(url, payload);
		const response = await body.json();
		await saveSession(response);
		localStorage.removeItem('verifier');
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const getLoginURL = async () => {
	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);

	window.localStorage.setItem('verifier', codeVerifier);
	const auth_url = new URL(import.meta.env.VITE_AUTH_ENDPOINT);

	const payload = {
		response_type: 'code',
		client_id: import.meta.env.VITE_CLIENT_ID,
		scope: import.meta.env.VITE_SCOPE,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		redirect_uri: import.meta.env.VITE_REDIRECT_URL,
	};

	auth_url.search = new URLSearchParams(payload).toString();
	return auth_url.toString();
};

export const logout = async () => {
	const authStore = useAuthStore();
	authStore.resetSession();
	await storage.dropSession();
};
