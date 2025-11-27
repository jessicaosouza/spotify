let db;
const DB_NAME = 'spotify';
const DB_VERSION = 1;

const openDatabase = () => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onsuccess = function (event) {
			resolve(event.target.result);
		};

		request.onupgradeneeded = function (event) {
			const connection = event.target.result;

			if (!connection.objectStoreNames.contains('session')) {
				connection.createObjectStore('session');
			}

			if (!connection.objectStoreNames.contains('playlists')) {
				connection.createObjectStore('playlists');
			}
		};

		request.onerror = function (event) {
			console.error(event.target.error);
			reject(`Erro ao abrir banco de dados: ${event.target.errorCode}`);
		};
	});
};

const init = async () => {
	if (db) return;
	try {
		db = await openDatabase();
	} catch (error) {
		console.error(error);
	}
};

const getSession = async () => {
	if (!db) return;
	return new Promise((resolve, reject) => {
		try {
			const transaction = db.transaction(['session'], 'readonly');
			const store = transaction.objectStore('session');
			const request = store.get('active');

			request.onsuccess = function (event) {
				const result = event.target.result;
				resolve(result || null);
			};

			request.onerror = function (event) {
				console.error('Erro ao recuperar sessão:', event.target.error);
				resolve(null); // Resolve com null ao invés de rejeitar
			};
		} catch (error) {
			console.error('Erro na transação:', error);
			resolve(null);
		}
	});
};

const hasActiveSession = async () => {
	const session = await getSession();
	return session;
};

const setActiveSession = data => {
	if (!db) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['session'], 'readwrite');
		const store = transaction.objectStore('session');

		const payload = {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			expires_in: data.expires_in,
			expiry: data.expiry,
			user: data.user,
		};

		// Como nossa store não tem keyPath, somos OBRIGADOS a passar a chave aqui.
		const request = store.put(payload, 'active');

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = event => {
			console.error('Erro ao salvar sessão:', event.target.error);
			reject(event.target.error);
		};
	});
};

const storePlaylist = (type, data) => {
	if (!db) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['playlists'], 'readwrite');
		const store = transaction.objectStore('playlists');

		const request = store.put(
			{
				type,
				value: data,
			},
			type,
		);

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = event => {
			console.error('Erro ao salvar playlist:', event.target.error);
			reject(event.target.error);
		};
	});
};

const dropSession = async () => {
	if (db) {
		db.close();
		db = null;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase(DB_NAME);

		request.onsuccess = () => {
			console.log('Banco excluído com sucesso!');
			resolve();
		};

		request.onerror = event => {
			console.error('Erro ao excluir banco:', event.target.error);
			reject(event.target.error);
		};

		// 2. Evento Crítico para ensinar: ONBLOCKED
		request.onblocked = () => {
			console.warn(
				'Operação bloqueada! Existem outras abas abertas usando este banco.',
			);
			// Aqui você poderia alertar o usuário para fechar outras abas
		};
	});
};

const getStore = (key, table) => {
	if (!db) return Promise.resolve(null);

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([table], 'readonly');
		const store = transaction.objectStore(table);

		const request = store.get(key);
		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = event => {
			console.error('Erro ao buscar registro:', event.target.error);
			reject(event.target.error);
		};
	});
};

export const storage = {
	init,
	hasActiveSession,
	setActiveSession,
	dropSession,
	storePlaylist,
	getStore,
};
