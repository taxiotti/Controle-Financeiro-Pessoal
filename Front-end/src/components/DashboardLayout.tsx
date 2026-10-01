import { BarChart3, FolderKanban, House, LogOut, Menu, Plus, ReceiptText, WalletCards, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api-client'
import { clearSessao, getUsuario, iniciais } from '../lib/session'

const navigation = [
  { to: '/', label: 'Início', icon: House },
  { to: '/transacoes', label: 'Transações', icon: ReceiptText },
  { to: '/categorias', label: 'Categorias', icon: FolderKanban },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

const pageNames: Record<string, string> = {
  '/': 'Visão geral',
  '/transacoes': 'Transações',
  '/categorias': 'Categorias',
  '/relatorios': 'Relatórios',
}

export function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const usuario = getUsuario()

  async function sair() {
    try {
      await api.logout()
    } finally {
      clearSessao()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand-row">
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><WalletCards size={18} /></span><span>Daniel Bank</span>
          </Link>
          <button className="mobile-close icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button>
        </div>
        <div className="profile-card"><div className="avatar">{iniciais(usuario?.nome ?? '')}</div><div><strong>{usuario?.nome ?? 'Minha conta'}</strong><span>{usuario?.email ?? 'Sessão ativa'}</span></div></div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={18} aria-hidden="true" />{label}</NavLink>)}
        </nav>
        <button className="nav-item logout-button" type="button" onClick={sair}><LogOut size={18} /> Sair</button>
        <span className="version">Daniel Bank · Front-end SDD</span>
      </aside>
      {menuOpen && <button className="sidebar-scrim" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}
      <main className="content">
        <header className="topbar"><div className="topbar-title"><button className="mobile-menu icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button><div className="breadcrumb"><span>Controle financeiro</span><span>/</span><strong>{pageNames[location.pathname] ?? 'Página'}</strong></div></div><Link className="primary-button compact-button" to="/transacoes?novo=1"><Plus size={17} /> Novo lançamento</Link></header>
        <Outlet />
      </main>
    </div>
  )
}
