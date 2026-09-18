import { useQuery } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { financeClient } from '../api/localClient'
import { currentMonth, decimalToCents, formatDate, formatMoney, monthLabel } from '../lib/format'

export function DashboardPage() {
  const selected = currentMonth()
  const resumo = useQuery({
    queryKey: ['resumo', selected.ano, selected.mes],
    queryFn: () => financeClient.obterResumo(selected.ano, selected.mes),
  })
  const recentes = useQuery({
    queryKey: ['transacoes', 'recentes'],
    queryFn: () => financeClient.listarTransacoes({ pageSize: 5 }),
  })

  const hasNegativeBalance = decimalToCents(resumo.data?.saldo ?? '0') < 0

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">RESUMO MENSAL</p>
          <h1>Olá, vamos organizar seu dinheiro.</h1>
          <p className="subtitle">Acompanhe receitas, despesas e saldo sem planilhas.</p>
        </div>
        <span className="period-badge">{monthLabel(selected.ano, selected.mes)}</span>
      </section>

      {resumo.isError && <div className="alert error">Não foi possível calcular o resumo. Recarregue a página.</div>}

      <section className="stats-grid" aria-label="Resumo financeiro do mês">
        <article className="stat-card income-card">
          <div className="stat-top"><span>Receitas</span><span className="stat-icon"><ArrowUpRight /></span></div>
          <strong>{resumo.isPending ? '—' : formatMoney(resumo.data?.totalReceitas ?? '0')}</strong>
          <small>Entradas em {monthLabel(selected.ano, selected.mes)}</small>
        </article>
        <article className="stat-card expense-card">
          <div className="stat-top"><span>Despesas</span><span className="stat-icon"><ArrowDownLeft /></span></div>
          <strong>{resumo.isPending ? '—' : formatMoney(resumo.data?.totalDespesas ?? '0')}</strong>
          <small>Saídas no mês selecionado</small>
        </article>
        <article className={hasNegativeBalance ? 'stat-card balance-card negative-balance' : 'stat-card balance-card'}>
          <div className="stat-top"><span>Saldo</span><span className="stat-icon"><CircleDollarSign /></span></div>
          <strong>{resumo.isPending ? '—' : formatMoney(resumo.data?.saldo ?? '0')}</strong>
          <small>{hasNegativeBalance ? 'Atenção: despesas acima das receitas' : 'Receitas menos despesas'}</small>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div><h2>Transações recentes</h2><p>Seus últimos movimentos financeiros</p></div>
          <Link className="text-link" to="/transacoes">Ver todas <ArrowUpRight size={15} /></Link>
        </div>

        {recentes.isPending && <div className="loading-state">Carregando transações…</div>}
        {recentes.isError && <div className="alert error">Não foi possível carregar as transações.</div>}
        {recentes.data?.items.length === 0 && (
          <div className="empty-state">
            <ReceiptText />
            <h3>Nenhum lançamento ainda</h3>
            <p>Cadastre uma receita ou despesa para começar o seu resumo.</p>
            <Link className="primary-button" to="/transacoes?novo=1">Criar primeiro lançamento</Link>
          </div>
        )}
        {!!recentes.data?.items.length && (
          <div className="transaction-list">
            {recentes.data.items.map((transaction) => (
              <div className="transaction-row" key={transaction.id}>
                <span className="category-dot" style={{ background: transaction.categoria?.cor }} />
                <div className="transaction-main">
                  <strong>{transaction.descricao}</strong>
                  <span>{transaction.categoria?.nome ?? 'Sem categoria'} · {formatDate(transaction.data)}</span>
                </div>
                <strong className={transaction.tipo === 'receita' ? 'money income' : 'money expense'}>
                  {transaction.tipo === 'receita' ? '+' : '−'} {formatMoney(transaction.valor)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
