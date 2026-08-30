const BASE = import.meta.env.VITE_API_BASE ?? ''

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options)
  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (!res.ok) {
    const message = body?.detail || body?.message || `Request failed (${res.status})`
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return body
}

export function checkHealth() {
  return request('/api/health')
}

export function fetchClasses() {
  return request('/api/classes')
}

export function predict(file, signal) {
  const form = new FormData()
  form.append('file', file)
  return request('/api/predict', { method: 'POST', body: form, signal })
}
