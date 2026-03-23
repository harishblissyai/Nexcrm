import client from './client'

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (email, full_name, password) => client.post('/auth/register', { email, full_name, password }),
  me: () => client.get('/auth/me'),
}
