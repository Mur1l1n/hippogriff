const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Não foi possível acessar o serviço (HTTP ${response.status}).`);
  }

  return response.status === 204 ? null : response.json();
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUsers = await request(`/users?email=${encodeURIComponent(normalizedEmail)}`);

  if (existingUsers.length > 0) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password }),
  });
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await request(
    `/users?email=${encodeURIComponent(normalizedEmail)}&password=${encodeURIComponent(password)}`,
  );

  if (users.length === 0) {
    throw new Error('E-mail ou senha não conferem.');
  }

  const { id, name, email: userEmail } = users[0];
  return { id, name, email: userEmail };
}

export function getUserSubnetworks(userId) {
  return request(`/subnetworks?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`);
}

export function saveSubnetwork(userId, subnetwork) {
  return request('/subnetworks', {
    method: 'POST',
    body: JSON.stringify({ ...subnetwork, userId, createdAt: new Date().toISOString() }),
  });
}