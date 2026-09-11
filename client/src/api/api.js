const API = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  })
  if (res.status === 401 && !url.includes('/auth/')) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateSettings: (data) => request('/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  sendVerification: () => request('/auth/send-verification', { method: 'POST' }),
  verifyEmail: (otp) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ otp }) }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getUsers: () => request('/admin/users'),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  setUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // Templates
  getTemplates: () => request('/templates'),
  getTemplate: (id) => request(`/templates/${id}`),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publishTemplate: (id) => request(`/templates/${id}/publish`, { method: 'POST' }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

  // Template library
  getLibraryTemplates: () => request('/templates/library'),
  saveLibraryTemplate: (id) => request(`/templates/${id}/save`, { method: 'POST' }),
  updateLibraryTemplate: (id, data) => request(`/templates/library/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLibraryTemplate: (id) => request(`/templates/library/${id}`, { method: 'DELETE' }),

  // Recipients
  previewExcel: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return fetch(`${API}/recipients/upload/preview`, { method: 'POST', body: fd, credentials: 'include' }).then(r => r.json())
  },
  uploadRecipients: (file, batchName, columnMapping) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('batchName', batchName)
    fd.append('columnMapping', JSON.stringify(columnMapping))
    return fetch(`${API}/recipients/upload`, { method: 'POST', body: fd, credentials: 'include' }).then(r => r.json())
  },
  getBatch: (name) => request(`/recipients/batch/${name}`),
  getBatches: () => request('/recipients/batches'),
  getBatchStats: (name) => request(`/recipients/batch/${name}/stats`),
  deleteBatch: (name) => request(`/recipients/batch/${name}`, { method: 'DELETE' }),
  resetBatch: (name) => request(`/recipients/batch/${name}/reset`, { method: 'POST' }),

  // Send
  send: (data) => request('/send', { method: 'POST', body: JSON.stringify(data) }),
  getActiveSends: () => request('/send/jobs/active'),
  getRecentSends: () => request('/send/recent'),

  // Stats
  getDailyStats: (days) => request(`/recipients/stats/daily?days=${days || 14}`),
}