import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { api } from '../lib/api-client'
import { clearSessao, getToken, getUsuario, SESSION_CLEARED_EVENT, setSessao } from '../lib/session'

export function ProtectedRoute() {
  const hasStoredSession = Boolean(getToken() && getUsuario())
  const [checking, setChecking] = useState(hasStoredSession)
  const [authenticated, setAuthenticated] = useState(hasStoredSession)

  useEffect(() => {
    function handleSessionCleared() {
      setAuthenticated(false)
      setChecking(false)
    }

    window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared)
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, handleSessionCleared)
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token || !getUsuario()) {
      return
    }
    api.me()
      .then((usuario) => { setSessao(token, usuario); setAuthenticated(true) })
      .catch(() => { clearSessao(); setAuthenticated(false) })
      .finally(() => setChecking(false))
  }, [])

  if (checking) return <div className="route-loading">Verificando sessão…</div>
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}
