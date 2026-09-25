import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import './auth.css'
import { ApiError, api } from './lib/api-client'
import { clearSessao, getToken, getUsuario, setSessao } from './lib/session'

type AuthMode = 'login' | 'register'

function AuthPage({ mode, onAuthenticated }: { mode: AuthMode; onAuthenticated: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const cadastro = mode === 'register'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const sessao = cadastro ? await api.register(nome, email, senha) : await api.login(email, senha)
      setSessao(sessao.accessToken, sessao.usuario)
      window.history.replaceState(null, '', '/')
      onAuthenticated()
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title">
    <div className="brand auth-brand"><span className="brand-mark">$</span><span>clarus</span></div>
    <p className="eyebrow">CONTROLE FINANCEIRO PESSOAL</p>
    <h1 id="auth-title">{cadastro ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
    <p className="auth-subtitle">{cadastro ? 'Comece a organizar sua vida financeira.' : 'Acesse seus dados financeiros com segurança.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {cadastro && <label>Nome<input required minLength={2} maxLength={80} value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" /></label>}
      <label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
      <label>Senha<input required type="password" minLength={cadastro ? 8 : 1} maxLength={128} value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete={cadastro ? 'new-password' : 'current-password'} /></label>
      {erro && <p className="auth-error" role="alert">{erro}</p>}
      <button className="submit-button" disabled={enviando} type="submit">{enviando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}</button>
    </form>
    <p className="auth-switch">{cadastro ? 'Já possui uma conta?' : 'Ainda não possui uma conta?'} <a href={cadastro ? '/login' : '/register'}>{cadastro ? 'Entrar' : 'Cadastre-se'}</a></p>
  </section></main>
}

type Transaction = {
  name: string
  category: string
  date: string
  amount: number
  icon: string
  color: string
}

const initialTransactions: Transaction[] = [
  { name: 'Salário', category: 'Renda', date: 'Hoje, 08:30', amount: 5200, icon: '↗', color: 'mint' },
  { name: 'Mercado do bairro', category: 'Alimentação', date: 'Ontem, 18:42', amount: -186.4, icon: '⌂', color: 'peach' },
  { name: 'Netflix', category: 'Assinaturas', date: '12 jun, 09:15', amount: -55.9, icon: '▶', color: 'lavender' },
  { name: 'Uber', category: 'Transporte', date: '11 jun, 21:10', amount: -24.5, icon: '↗', color: 'blue' },
]

function Dashboard() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Visão geral')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', amount: '', type: 'expense' })

  const totalExpenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(form.amount.replace(',', '.'))
    if (!form.name.trim() || !amount) return

    setTransactions((current) => [
      {
        name: form.name,
        category: form.type === 'income' ? 'Renda' : 'Outros',
        date: 'Agora',
        amount: form.type === 'income' ? amount : -amount,
        icon: form.type === 'income' ? '↗' : '•',
        color: form.type === 'income' ? 'mint' : 'peach',
      },
      ...current,
    ])
    setForm({ name: '', amount: '', type: 'expense' })
    setIsModalOpen(false)
    setNotice('Lançamento adicionado')
    window.setTimeout(() => setNotice(''), 2500)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">$</span><span>clarus</span></div>
        <div className="profile-card"><div className="avatar">LM</div><div><strong>Larissa Martins</strong><span>Plano essencial</span></div><button className="more-button" aria-label="Mais opções">•••</button></div>
        <nav className="main-nav" aria-label="Navegação principal">
          {['Visão geral', 'Transações', 'Orçamentos', 'Metas'].map((item, index) => <button key={item} className={activeNav === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(item)}><span className="nav-icon">{['⌂', '↔', '▥', '◎'][index]}</span>{item}</button>)}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item" onClick={async () => { try { await api.logout() } finally { clearSessao(); window.location.assign('/login') } }}><span className="nav-icon">↪</span>Sair</button><div className="help-box"><span className="help-icon">?</span><strong>Precisa de ajuda?</strong><span>Acesse nossa central de suporte.</span><button>Falar com suporte <span>↗</span></button></div><span className="version">Clarus v1.0.0</span></div>
      </aside>

      <main className="content">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div><div className="top-actions"><button className="export-button" onClick={async () => { try { const arquivo = await api.exportarCsv(); const url = URL.createObjectURL(arquivo); const link = document.createElement('a'); link.href = url; link.download = 'transacoes.csv'; link.click(); URL.revokeObjectURL(url) } catch (error) { setNotice(error instanceof ApiError && error.status === 401 ? 'Sessão expirada. Entre novamente.' : 'Não foi possível exportar o CSV.') } }}>Exportar CSV</button><button className="add-button" onClick={() => setIsModalOpen(true)}><span>+</span> Novo lançamento</button></div></header>
        <div className="page-heading"><div><p className="eyebrow">QUARTA-FEIRA, 18 DE JUNHO DE 2025</p><h1>Bom dia, Larissa <span>✦</span></h1><p className="subtitle">Aqui está um resumo do seu dinheiro hoje.</p></div><button className="period-select">Junho 2025 <span>⌄</span></button></div>

        <section className="stats-grid" aria-label="Resumo financeiro"><article className="stat-card balance"><div className="stat-top"><span>Saldo disponível</span><span className="stat-icon">◒</span></div><strong>R$ 8.420,60</strong><div className="trend positive"><span>↗ 12,8%</span><span>vs. mês anterior</span></div></article><article className="stat-card"><div className="stat-top"><span>Receitas</span><span className="stat-icon mint-icon">↗</span></div><strong>R$ 5.200,00</strong><div className="trend positive"><span>↗ 5,2%</span><span>vs. mês anterior</span></div></article><article className="stat-card"><div className="stat-top"><span>Despesas</span><span className="stat-icon peach-icon">↘</span></div><strong>R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><div className="trend negative"><span>↘ 3,4%</span><span>vs. mês anterior</span></div></article><article className="stat-card"><div className="stat-top"><span>Taxa de economia</span><span className="stat-icon blue-icon">◔</span></div><strong>42,6%</strong><div className="trend positive"><span>↗ 8,1%</span><span>vs. mês anterior</span></div></article></section>

        <section className="dashboard-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h2>Fluxo financeiro</h2><p>Receitas e despesas ao longo do mês</p></div><div className="legend"><span><i className="income-dot" />Receitas</span><span><i className="expense-dot" />Despesas</span></div></div><div className="chart"><div className="chart-labels"><span>R$ 6k</span><span>R$ 4k</span><span>R$ 2k</span><span>R$ 0</span></div><div className="chart-area"><div className="grid-line line-1" /><div className="grid-line line-2" /><div className="grid-line line-3" /><div className="grid-line line-4" /><svg viewBox="0 0 620 170" preserveAspectRatio="none" role="img" aria-label="Gráfico de receitas e despesas"><path className="area-fill" d="M0,125 C45,120 60,108 90,112 S140,85 175,91 S225,70 260,78 S310,45 350,59 S395,28 430,45 S475,20 510,35 S560,8 620,14 L620,170 L0,170Z" /><path className="income-line" d="M0,125 C45,120 60,108 90,112 S140,85 175,91 S225,70 260,78 S310,45 350,59 S395,28 430,45 S475,20 510,35 S560,8 620,14" /><path className="expense-line" d="M0,148 C50,138 70,145 100,133 S150,128 180,135 S225,110 260,121 S300,100 340,111 S390,91 420,101 S460,74 500,88 S550,58 620,65" /></svg><div className="chart-days"><span>01 jun</span><span>05 jun</span><span>10 jun</span><span>15 jun</span><span>18 jun</span></div></div></div></article><article className="panel goal-panel"><div className="panel-heading"><div><h2>Meta do mês</h2><p>Economizar para viajar</p></div><button className="kebab" aria-label="Opções da meta">•••</button></div><div className="goal-circle"><div><strong>68%</strong><span>concluído</span></div></div><div className="goal-values"><span><small>Guardado</small><strong>R$ 2.720</strong></span><span><small>Objetivo</small><strong>R$ 4.000</strong></span></div><div className="goal-progress"><span /></div><p className="goal-footer"><span>Faltam R$ 1.280</span><strong>12 dias restantes</strong></p></article></section>

        <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Transações recentes</h2><p>Seus últimos movimentos financeiros</p></div><button className="text-button">Ver todas <span>↗</span></button></div><div className="transactions-list">{transactions.map((transaction) => <div className="transaction" key={`${transaction.name}-${transaction.date}`}><div className={`transaction-icon ${transaction.color}`}>{transaction.icon}</div><div className="transaction-info"><strong>{transaction.name}</strong><span>{transaction.category} <b>•</b> {transaction.date}</span></div><strong className={transaction.amount > 0 ? 'amount income' : 'amount'}>{transaction.amount > 0 ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><button className="row-more" aria-label={`Opções de ${transaction.name}`}>•••</button></div>)}</div></section>
      </main>

      {isModalOpen && <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}><form className="modal" onSubmit={addTransaction} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">MOVIMENTO FINANCEIRO</p><h2>Novo lançamento</h2></div><button type="button" className="close-button" onClick={() => setIsModalOpen(false)}>×</button></div><label>Descrição<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Café da manhã" /></label><label>Valor<input inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0,00" /></label><div className="type-switch"><button type="button" className={form.type === 'expense' ? 'selected' : ''} onClick={() => setForm({ ...form, type: 'expense' })}>Despesa</button><button type="button" className={form.type === 'income' ? 'selected income-selected' : ''} onClick={() => setForm({ ...form, type: 'income' })}>Receita</button></div><button className="submit-button" type="submit">Adicionar lançamento <span>↗</span></button></form></div>}
      {notice && <div className="toast">✓ {notice}</div>}
    </div>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [sessaoValida, setSessaoValida] = useState(Boolean(getToken()))

  useEffect(() => {
    const atualizarRota = () => setPath(window.location.pathname)
    window.addEventListener('popstate', atualizarRota)
    return () => window.removeEventListener('popstate', atualizarRota)
  }, [])

  useEffect(() => {
    if (!getToken()) {
      setSessaoValida(false)
      return
    }
    api.me().then((usuario) => setSessao(getToken()!, usuario)).catch(clearSessao).finally(() => setSessaoValida(false))
  }, [])

  if (path === '/login' || path === '/register') {
    return <AuthPage mode={path === '/register' ? 'register' : 'login'} onAuthenticated={() => setPath('/')} />
  }
  if (sessaoValida) return <main className="auth-page"><p>Verificando sessão...</p></main>
  if (!getUsuario()) {
    window.history.replaceState(null, '', '/login')
    return <AuthPage mode="login" onAuthenticated={() => setPath('/')} />
  }
  return <Dashboard />
}

export default App
