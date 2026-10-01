import { useEffect, useMemo, useState, type FormEvent } from 'react'

import './App.css'
import { ComparativoMes } from './components/comparativo-mes'
import { GraficoLinha, type EvolutionPoint } from './components/grafico-linha'
import { GraficoPizza, type PieSlice } from './components/grafico-pizza'
import { ResumoCards, type MonthlySummary } from './components/resumo-cards'
import { createTransaction, getAllTransactions, getCategories } from './lib/api-client'
import {
  currentMonthKey,
  formatDate,
  formatMoney,
  monthLabel,
  monthOffset,
  parseMoney,
  totalForType,
  transactionsForMonth,
} from './lib/utils'
import type { Category, Transaction, TransactionInput, TransactionType } from './types/finance'

const navigation = [
  { label: 'Visão geral', icon: '⌂' },
  { label: 'Transações', icon: '↔' },
  { label: 'Relatórios', icon: '◫' },
  { label: 'Metas', icon: '◎' },
]

type FormState = {
  description: string
  amount: string
  type: TransactionType
  date: string
  categoryId: string
}

function localDateInput(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function summaryFor(transactions: Transaction[]): MonthlySummary {
  const income = totalForType(transactions, 'receita')
  const expenses = totalForType(transactions, 'despesa')
  return { income, expenses, balance: income - expenses }
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [activeNav, setActiveNav] = useState('Visão geral')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState<FormState>({
    description: '',
    amount: '',
    type: 'despesa',
    date: localDateInput(),
    categoryId: '',
  })

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const [loadedTransactions, loadedCategories] = await Promise.all([
          getAllTransactions(),
          getCategories(),
        ])
        if (!mounted) return
        setTransactions(loadedTransactions)
        setCategories(loadedCategories)
        setError('')
      } catch (requestError) {
        if (!mounted) return
        setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os dados.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      mounted = false
    }
  }, [])

  const selectedTransactions = useMemo(
    () => transactionsForMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  )
  const previousTransactions = useMemo(
    () => transactionsForMonth(transactions, monthOffset(selectedMonth, -1)),
    [selectedMonth, transactions],
  )
  const summary = useMemo(() => summaryFor(selectedTransactions), [selectedTransactions])
  const previousSummary = useMemo(() => summaryFor(previousTransactions), [previousTransactions])

  const pieData = useMemo<PieSlice[]>(() => {
    const grouped = new Map<string, PieSlice>()
    selectedTransactions
      .filter((transaction) => transaction.tipo === 'despesa')
      .forEach((transaction) => {
        const current = grouped.get(transaction.categoriaId)
        const value = parseMoney(transaction.valor)
        grouped.set(transaction.categoriaId, {
          id: transaction.categoriaId,
          name: transaction.categoria.nome,
          color: transaction.categoria.cor,
          value: (current?.value ?? 0) + value,
        })
      })
    return [...grouped.values()].sort((left, right) => right.value - left.value)
  }, [selectedTransactions])

  const evolutionData = useMemo<EvolutionPoint[]>(() => (
    Array.from({ length: 6 }, (_, index) => monthOffset(selectedMonth, index - 5)).map((key) => {
      const monthTransactions = transactionsForMonth(transactions, key)
      const monthSummary = summaryFor(monthTransactions)
      return {
        key,
        label: monthLabel(key).split(' ')[0].slice(0, 3),
        income: monthSummary.income,
        expenses: monthSummary.expenses,
      }
    })
  ), [selectedMonth, transactions])

  const recentTransactions = useMemo(() => (
    [...transactions]
      .sort((left, right) => right.data.localeCompare(left.data))
      .slice(0, 6)
  ), [transactions])

  const compatibleCategories = useMemo(
    () => categories.filter((category) => category.tipo === form.type || category.tipo === 'ambos'),
    [categories, form.type],
  )

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  function openTransactionModal() {
    const firstCategory = categories.find((category) => category.tipo === 'despesa' || category.tipo === 'ambos')
    setForm({
      description: '',
      amount: '',
      type: 'despesa',
      date: localDateInput(),
      categoryId: firstCategory?.id ?? '',
    })
    setIsModalOpen(true)
  }

  function changeTransactionType(type: TransactionType) {
    const firstCategory = categories.find((category) => category.tipo === type || category.tipo === 'ambos')
    setForm((current) => ({ ...current, type, categoryId: firstCategory?.id ?? '' }))
  }

  async function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = parseMoney(form.amount)
    if (!form.description.trim() || amount <= 0 || !form.date || !form.categoryId) {
      showNotice('Preencha descrição, valor, data e categoria.')
      return
    }

    const input: TransactionInput = {
      tipo: form.type,
      valor: amount,
      descricao: form.description.trim(),
      data: form.date,
      categoriaId: form.categoryId,
    }

    try {
      const created = await createTransaction(input)
      setTransactions((current) => [created, ...current])
      setIsModalOpen(false)
      showNotice('Lançamento adicionado')
    } catch (requestError) {
      showNotice(requestError instanceof Error ? requestError.message : 'Não foi possível salvar o lançamento.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">$</span><span>clarus</span></div>
        <div className="profile-card">
          <div className="avatar">LM</div>
          <div><strong>Larissa Martins</strong><span>Plano essencial</span></div>
          <button className="more-button" aria-label="Mais opções">•••</button>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={activeNav === item.label ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setActiveNav(item.label)
                if (item.label !== 'Visão geral') showNotice('Esta visão será conectada na próxima etapa.')
              }}
            >
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><span className="nav-icon">⚙</span>Configurações</button>
          <div className="help-box"><span className="help-icon">?</span><strong>Precisa de ajuda?</strong><span>Acesse nossa central de suporte.</span><button>Falar com suporte <span>↗</span></button></div>
          <span className="version">Clarus v1.0.0</span>
        </div>
      </aside>

      <main className="content" aria-busy={isLoading}>
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Pesquisar">⌕</button>
            <button className="icon-button notification" aria-label="Notificações">♧<i /></button>
            <button className="add-button" onClick={openTransactionModal}><span>+</span> Novo lançamento</button>
          </div>
        </header>

        <div className="page-heading">
          <div>
            <p className="eyebrow">PAINEL FINANCEIRO</p>
            <h1>Bom dia, Larissa <span>✦</span></h1>
            <p className="subtitle">Aqui está um resumo do seu dinheiro no período selecionado.</p>
          </div>
          <label className="period-select">Período
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              aria-label="Selecionar mês do dashboard"
            />
          </label>
        </div>

        {error && <div className="api-alert" role="alert"><strong>Não foi possível sincronizar com o backend.</strong><span>{error}</span><small>Confira se a API está rodando em http://localhost:8000 e execute o seed.</small></div>}

        <ResumoCards summary={summary} loading={isLoading} />

        <section className="dashboard-grid reports-grid" aria-label="Análises financeiras">
          <GraficoLinha data={evolutionData} />
          <GraficoPizza data={pieData} />
        </section>

        <section className="dashboard-grid lower-grid">
          <ComparativoMes
            current={summary}
            previous={previousSummary}
            currentLabel={monthLabel(selectedMonth)}
            previousLabel={monthLabel(monthOffset(selectedMonth, -1))}
          />
          <section className="panel transactions-panel">
            <div className="panel-heading"><div><h2>Transações recentes</h2><p>Últimos movimentos vindos da API</p></div><button className="text-button" onClick={() => showNotice('A listagem completa será disponibilizada na tela de transações.')}>Ver todas <span>↗</span></button></div>
            <div className="transactions-list">
              {recentTransactions.length === 0 ? <div className="list-empty">Nenhuma transação cadastrada ainda.</div> : recentTransactions.map((transaction) => (
                <div className="transaction" key={transaction.id}>
                  <div className="transaction-icon" style={{ color: transaction.categoria.cor, backgroundColor: `${transaction.categoria.cor}18` }}>{transaction.tipo === 'receita' ? '↗' : '•'}</div>
                  <div className="transaction-info"><strong>{transaction.descricao}</strong><span>{transaction.categoria.nome} <b>•</b> {formatDate(transaction.data)}</span></div>
                  <strong className={transaction.tipo === 'receita' ? 'amount income' : 'amount'}>{transaction.tipo === 'receita' ? '+' : '−'} {formatMoney(parseMoney(transaction.valor))}</strong>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <form className="modal" onSubmit={addTransaction} onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading"><div><p className="eyebrow">MOVIMENTO FINANCEIRO</p><h2>Novo lançamento</h2></div><button type="button" className="close-button" onClick={() => setIsModalOpen(false)}>×</button></div>
            <label>Descrição<input autoFocus value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ex.: Café da manhã" /></label>
            <div className="form-row"><label>Valor<input inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0,00" /></label><label>Data<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label></div>
            <div className="type-switch"><button type="button" className={form.type === 'despesa' ? 'selected' : ''} onClick={() => changeTransactionType('despesa')}>Despesa</button><button type="button" className={form.type === 'receita' ? 'selected income-selected' : ''} onClick={() => changeTransactionType('receita')}>Receita</button></div>
            <label>Categoria<select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Selecione uma categoria</option>{compatibleCategories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label>
            <button className="submit-button" type="submit">Adicionar lançamento <span>↗</span></button>
          </form>
        </div>
      )}
      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </div>
  )
}

export default App