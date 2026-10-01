import { ArrowDownLeft, ArrowUpRight, CircleDollarSign } from 'lucide-react'
import { decimalToCents, formatMoney } from '../lib/format'

export type MonthlySummary = {
  income: string | number
  expenses: string | number
  balance: string | number
}

type ResumoCardsProps = {
  summary: MonthlySummary
  loading?: boolean
  periodLabel?: string
}

function SummaryValue({ value, loading }: { value: string | number; loading: boolean }) {
  return <strong>{loading ? '—' : formatMoney(value)}</strong>
}

export function ResumoCards({ summary, loading = false, periodLabel }: ResumoCardsProps) {
  const hasNegativeBalance = decimalToCents(summary.balance) < 0

  return (
    <section className="stats-grid" aria-label="Resumo financeiro do mês">
      <article className="stat-card income-card">
        <div className="stat-top">
          <span>Receitas</span>
          <span className="stat-icon"><ArrowUpRight /></span>
        </div>
        <SummaryValue value={summary.income} loading={loading} />
        <small>{periodLabel ? `Entradas em ${periodLabel}` : 'Entradas no período'}</small>
      </article>

      <article className="stat-card expense-card">
        <div className="stat-top">
          <span>Despesas</span>
          <span className="stat-icon"><ArrowDownLeft /></span>
        </div>
        <SummaryValue value={summary.expenses} loading={loading} />
        <small>Saídas no mês selecionado</small>
      </article>

      <article className={hasNegativeBalance ? 'stat-card balance-card negative-balance' : 'stat-card balance-card'}>
        <div className="stat-top">
          <span>Saldo</span>
          <span className="stat-icon"><CircleDollarSign /></span>
        </div>
        <SummaryValue value={summary.balance} loading={loading} />
        <small>{hasNegativeBalance ? 'Atenção: despesas acima das receitas' : 'Receitas menos despesas'}</small>
      </article>
    </section>
  )
}
