import { formatMoney } from '../lib/utils'

export type MonthlySummary = {
  income: number
  expenses: number
  balance: number
}

type ResumoCardsProps = {
  summary: MonthlySummary
  loading?: boolean
}

function SummaryValue({ value, loading }: { value: number; loading: boolean }) {
  return <strong>{loading ? 'Carregando…' : formatMoney(value)}</strong>
}

export function ResumoCards({ summary, loading = false }: ResumoCardsProps) {
  const balanceClass = summary.balance < 0 ? 'negative-value' : 'positive-value'

  return (
    <section className="stats-grid" aria-label="Resumo financeiro do mês">
      <article className="stat-card balance-card">
        <div className="stat-top">
          <span>Saldo do mês</span>
          <span className="stat-icon">◒</span>
        </div>
        <SummaryValue value={summary.balance} loading={loading} />
        <span className={`stat-caption ${balanceClass}`}>
          {summary.balance < 0 ? 'Saldo negativo' : 'Saldo disponível'}
        </span>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Receitas</span>
          <span className="stat-icon mint-icon">↗</span>
        </div>
        <SummaryValue value={summary.income} loading={loading} />
        <span className="stat-caption">Entradas no período</span>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Despesas</span>
          <span className="stat-icon peach-icon">↘</span>
        </div>
        <SummaryValue value={summary.expenses} loading={loading} />
        <span className="stat-caption">Saídas no período</span>
      </article>
    </section>
  )
}