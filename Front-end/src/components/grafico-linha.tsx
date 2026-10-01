import { formatMoney } from '../lib/format'

export type EvolutionPoint = {
  key: string
  label: string
  income: number
  expenses: number
}

type GraficoLinhaProps = {
  data: EvolutionPoint[]
  subtitle?: string
}

function linePath(values: number[], max: number): string {
  if (values.length === 0) return ''
  const width = 640
  const height = 185
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
    const y = height - (value / max) * height
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

export function GraficoLinha({ data, subtitle = 'Receitas e despesas dos últimos meses' }: GraficoLinhaProps) {
  const max = Math.max(...data.flatMap((item) => [item.income, item.expenses]), 1)
  const incomePath = linePath(data.map((item) => item.income), max)
  const expensePath = linePath(data.map((item) => item.expenses), max)

  return (
    <article className="panel line-panel chart-card line-chart-card">
      <div className="panel-heading">
        <div>
          <h2>Evolução mensal</h2>
          <p>{subtitle}</p>
        </div>
        <div className="legend" aria-label="Legenda do gráfico">
          <span><i className="income-dot" />Receitas</span>
          <span><i className="expense-dot" />Despesas</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-chart" role="status">
          <span className="empty-chart-icon">⌁</span>
          <strong>Sem histórico suficiente</strong>
          <span>Os valores mensais aparecerão após os primeiros lançamentos.</span>
        </div>
      ) : (
        <>
          <div className="line-chart-wrap">
            <div className="line-axis" aria-hidden="true">
              <span>{formatMoney(max)}</span>
              <span>{formatMoney(max / 2)}</span>
              <span>R$ 0</span>
            </div>
            <div className="line-chart-area">
              <div className="line-grid grid-top" />
              <div className="line-grid grid-middle" />
              <div className="line-grid grid-bottom" />
              <svg viewBox="0 0 640 185" preserveAspectRatio="none" role="img" aria-label="Evolução de receitas e despesas por mês">
                <path className="income-line" d={incomePath} />
                <path className="expense-line" d={expensePath} />
                {data.map((item, index) => {
                  const x = data.length === 1 ? 320 : (index / (data.length - 1)) * 640
                  const incomeY = 185 - (item.income / max) * 185
                  const expenseY = 185 - (item.expenses / max) * 185
                  return (
                    <g key={item.key}>
                      <circle className="income-point" cx={x} cy={incomeY} r="4" />
                      <circle className="expense-point" cx={x} cy={expenseY} r="4" />
                    </g>
                  )
                })}
              </svg>
              <div className="chart-days">
                {data.map((item) => <span key={item.key}>{item.label}</span>)}
              </div>
            </div>
          </div>

          <table className="sr-only">
            <caption>Dados da evolução mensal</caption>
            <thead>
              <tr><th>Mês</th><th>Receitas</th><th>Despesas</th></tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td>{formatMoney(item.income)}</td>
                  <td>{formatMoney(item.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </article>
  )
}
