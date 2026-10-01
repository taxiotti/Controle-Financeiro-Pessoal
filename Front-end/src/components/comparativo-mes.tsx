import { decimalToCents, formatMoney } from '../lib/format'
import type { MonthlySummary } from './resumo-cards'

type ComparativoMesProps = {
  current: MonthlySummary
  previous: MonthlySummary
  currentLabel: string
  previousLabel: string
}

function asCents(value: string | number): number {
  return decimalToCents(value)
}

function formatSignedDelta(cents: number): string {
  const sign = cents >= 0 ? '+' : '−'
  return `${sign} ${formatMoney(Math.abs(cents) / 100)}`
}

function comparisonTone(cents: number, invert = false): string {
  const positive = invert ? cents < 0 : cents >= 0
  return positive ? 'comparison-positive' : 'comparison-negative'
}

export function ComparativoMes({ current, previous, currentLabel, previousLabel }: ComparativoMesProps) {
  const rows = [
    { label: 'Receitas', current: current.income, previous: previous.income, invert: false },
    { label: 'Despesas', current: current.expenses, previous: previous.expenses, invert: true },
    { label: 'Saldo', current: current.balance, previous: previous.balance, invert: false },
  ]

  return (
    <article className="panel comparison-panel">
      <div className="panel-heading">
        <div>
          <h2>Comparativo mensal</h2>
          <p>Como o período mudou em relação ao anterior</p>
        </div>
      </div>
      <div className="comparison-head">
        <span>Indicador</span>
        <strong>{currentLabel}</strong>
        <strong>{previousLabel}</strong>
      </div>
      <div className="comparison-rows">
        {rows.map((row) => {
          const delta = asCents(row.current) - asCents(row.previous)
          return (
            <div className="comparison-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{formatMoney(row.current)}</strong>
              <span className="previous-value">{formatMoney(row.previous)}</span>
              <small className={comparisonTone(delta, row.invert)}>{formatSignedDelta(delta)}</small>
            </div>
          )
        })}
      </div>
      <p className="comparison-note">A variação mostra a diferença nominal entre os dois meses.</p>
    </article>
  )
}
