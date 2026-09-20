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
  register: (data) => request('/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/v1/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/v1/auth/logout', { method: 'POST' }),
  me: () => request('/v1/auth/me'),
  updateSettings: (data) => request('/v1/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/v1/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  sendVerification: (email) => request('/v1/auth/send-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyEmail: (otp, email) => request('/v1/auth/verify-email', { method: 'POST', body: JSON.stringify({ otp, email }) }),
  deleteAccount: () => request('/v1/auth/account', { method: 'DELETE' }),
  forgotPassword: (email) => request('/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/v1/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getPlans: () => request('/v1/plans'),
  getUsage: () => request('/v1/plans/usage'),
  contactOwner: (data) => request('/v1/plans/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getUsers: () => request('/v1/admin/users'),
  deleteUser: (id) => request(`/v1/admin/users/${id}`, { method: 'DELETE' }),
  setUserRole: (id, role) => request(`/v1/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  setUserPlan: (id, plan) => request(`/v1/admin/users/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) }),

  // Templates
  getTemplates: () => request('/v1/templates'),
  getTemplate: (id) => request(`/v1/templates/${id}`),
  createTemplate: (data) => request('/v1/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/v1/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publishTemplate: (id) => request(`/v1/templates/${id}/publish`, { method: 'POST' }),
  deleteTemplate: (id) => request(`/v1/templates/${id}`, { method: 'DELETE' }),

  // Template library
  getLibraryTemplates: () => request('/v1/templates/library'),
  saveLibraryTemplate: (id) => request(`/v1/templates/${id}/save`, { method: 'POST' }),
  updateLibraryTemplate: (id, data) => request(`/v1/templates/library/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLibraryTemplate: (id) => request(`/v1/templates/library/${id}`, { method: 'DELETE' }),

  // Recipients
  previewExcel: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return fetch(`${API}/v1/recipients/upload/preview`, { method: 'POST', body: fd, credentials: 'include' }).then(r => r.json())
  },
  uploadRecipients: (file, batchName, columnMapping) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('batchName', batchName)
    fd.append('columnMapping', JSON.stringify(columnMapping))
    return fetch(`${API}/v1/recipients/upload`, { method: 'POST', body: fd, credentials: 'include' }).then(r => r.json())
  },
  getBatch: (name) => request(`/v1/recipients/batch/${name}`),
  getBatches: () => request('/v1/recipients/batches'),
  getBatchStats: (name) => request(`/v1/recipients/batch/${name}/stats`),
  deleteBatch: (name) => request(`/v1/recipients/batch/${name}`, { method: 'DELETE' }),
  resetBatch: (name) => request(`/v1/recipients/batch/${name}/reset`, { method: 'POST' }),

  // Send
  send: (data) => request('/v2/send', { method: 'POST', body: JSON.stringify(data) }),
  getActiveSends: () => request('/v1/send/jobs/active'),
  getRecentSends: () => request('/v1/send/recent'),

  // Stats
  getDailyStats: (days) => request(`/v1/recipients/stats/daily?days=${days || 14}`),
}