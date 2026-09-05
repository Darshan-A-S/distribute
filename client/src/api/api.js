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

  // Templates
  getTemplates: () => request('/templates'),
  getTemplate: (id) => request(`/templates/${id}`),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

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

  // Send
  send: (data) => request('/send', { method: 'POST', body: JSON.stringify(data) }),
  getSendStatus: (batchName) => request(`/send/status/${batchName}`),
  getRecentSends: () => request('/send/recent'),
}