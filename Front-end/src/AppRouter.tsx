import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import './styles.css'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const TransacoesPage = lazy(() => import('./pages/TransacoesPage').then((module) => ({ default: module.TransacoesPage })))
const CategoriasPage = lazy(() => import('./pages/CategoriasPage').then((module) => ({ default: module.CategoriasPage })))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage').then((module) => ({ default: module.RelatoriosPage })))

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="route-loading">Carregando página…</div>}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transacoes" element={<TransacoesPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
