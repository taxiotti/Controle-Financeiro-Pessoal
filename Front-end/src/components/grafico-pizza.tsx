import type { CSSProperties } from 'react'
import { BarChart3 } from 'lucide-react'
import { formatMoney } from '../lib/format'

export type PieSlice = {
  id: string
  name: string
  color: string
  value: number
}

type GraficoPizzaProps = {
  data: PieSlice[]
  title?: string
  subtitle?: string
  typeLabel?: string
}

function pieStyle(data: PieSlice[]): CSSProperties {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0) return { '--pie-gradient': 'conic-gradient(#e8eee9 0deg 360deg)' } as CSSProperties

  let start = 0
  const stops = data.map((item) => {
    const end = start + (item.value / total) * 360
    const stop = `${item.color} ${start}deg ${end}deg`
    start = end
    return stop
  })

  return { '--pie-gradient': `conic-gradient(${stops.join(', ')})` } as CSSProperties
}

export function GraficoPizza({
  data,
  title = 'Despesas por categoria',
  subtitle,
  typeLabel = 'despesas',
}: GraficoPizzaProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <article className="panel pie-panel chart-card">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle ?? `Distribuição das ${typeLabel} no período`}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state" role="status">
          <BarChart3 />
          <h3>Sem dados para este mês</h3>
          <p>Cadastre transações ou escolha outro período.</p>
        </div>
      ) : (
        <div className="pie-content">
          <div
            className="pie-chart"
            style={pieStyle(data)}
            role="img"
            aria-label={`Gráfico de pizza com ${formatMoney(total)} em ${typeLabel}`}
          >
            <div className="pie-hole">
              <strong>{formatMoney(total)}</strong>
              <span>total</span>
            </div>
          </div>

          <div className="pie-legend" aria-label="Detalhamento por categoria">
            {data.map((slice) => (
              <div className="pie-legend-row" key={slice.id}>
                <span className="legend-label">
                  <i style={{ backgroundColor: slice.color }} />
                  {slice.name}
                </span>
                <span>
                  <strong>{formatMoney(slice.value)}</strong>
                  <small>{Math.round((slice.value / total) * 100)}%</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length > 0 && (
        <table className="sr-only">
          <caption>Dados do gráfico de {typeLabel} por categoria</caption>
          <thead>
            <tr><th>Categoria</th><th>Total</th></tr>
          </thead>
          <tbody>
            {data.map((slice) => (
              <tr key={slice.id}>
                <td>{slice.name}</td>
                <td>{formatMoney(slice.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  )
}
