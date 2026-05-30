'use client'

const SESSION_KEY = 'promptreel_session'

export interface StoredSession {
  access_token: string
  refresh_token?: string
  expires_at?: number
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getStoredSession(): StoredSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as StoredSession
    return session.access_token ? session : null
  } catch {
    clearStoredSession()
    return null
  }
}

export function getAccessToken() {
  return getStoredSession()?.access_token || ''
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAccessToken()
  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
