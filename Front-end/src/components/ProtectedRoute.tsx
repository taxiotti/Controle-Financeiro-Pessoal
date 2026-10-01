import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { api } from '../lib/api-client'
import { clearSessao, getToken, getUsuario, setSessao } from '../lib/session'

export function ProtectedRoute() {
  const [checking, setChecking] = useState(Boolean(getToken()))
  const [authenticated, setAuthenticated] = useState(Boolean(getToken() && getUsuario()))

  useEffect(() => {
    const token = getToken()
    if (!token || !getUsuario()) {
      setAuthenticated(false)
      setChecking(false)
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
