import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import './styles.css'
import './auth.css'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const TransacoesPage = lazy(() => import('./pages/TransacoesPage').then((module) => ({ default: module.TransacoesPage })))
const CategoriasPage = lazy(() => import('./pages/CategoriasPage').then((module) => ({ default: module.CategoriasPage })))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage').then((module) => ({ default: module.RelatoriosPage })))

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="route-loading">Carregando página…</div>}>
      <Routes>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transacoes" element={<TransacoesPage />} />
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
