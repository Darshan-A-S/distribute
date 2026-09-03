const API = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
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
    return fetch(`${API}/recipients/upload/preview`, { method: 'POST', body: fd }).then(r => r.json())
  },
  uploadRecipients: (file, batchName, columnMapping) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('batchName', batchName)
    fd.append('columnMapping', JSON.stringify(columnMapping))
    return fetch(`${API}/recipients/upload`, { method: 'POST', body: fd }).then(r => r.json())
  },
  getBatch: (name) => request(`/recipients/batch/${name}`),
  getBatchStats: (name) => request(`/recipients/batch/${name}/stats`),
  deleteBatch: (name) => request(`/recipients/batch/${name}`, { method: 'DELETE' }),

  // Send
  send: (data) => request('/send', { method: 'POST', body: JSON.stringify(data) }),
  getSendStatus: (batchName) => request(`/send/status/${batchName}`),
}
