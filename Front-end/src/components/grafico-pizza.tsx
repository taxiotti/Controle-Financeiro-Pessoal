import type { CSSProperties } from 'react'

import { formatMoney } from '../lib/utils'

export type PieSlice = {
  id: string
  name: string
  color: string
  value: number
}

type GraficoPizzaProps = {
  data: PieSlice[]
  typeLabel?: string
}

function pieStyle(data: PieSlice[]): CSSProperties {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let start = 0
  const stops = data.map((item) => {
    const end = start + (item.value / total) * 360
    const stop = `${item.color} ${start}deg ${end}deg`
    start = end
    return stop
  })

  return { '--pie-gradient': `conic-gradient(${stops.join(', ')})` } as CSSProperties
}

export function GraficoPizza({ data, typeLabel = 'despesas' }: GraficoPizzaProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <article className="panel pie-panel">
      <div className="panel-heading">
        <div>
          <h2>Despesas por categoria</h2>
          <p>Distribuição das {typeLabel} no período</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-chart" role="status">
          <span className="empty-chart-icon">◌</span>
          <strong>Nenhuma despesa no período</strong>
          <span>Cadastre um lançamento para visualizar a distribuição.</span>
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
          <caption>Dados do gráfico de despesas por categoria</caption>
          <thead><tr><th>Categoria</th><th>Total</th></tr></thead>
          <tbody>{data.map((slice) => <tr key={slice.id}><td>{slice.name}</td><td>{formatMoney(slice.value)}</td></tr>)}</tbody>
        </table>
      )}
    </article>
  )
}