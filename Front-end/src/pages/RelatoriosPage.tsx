import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSearchParams } from 'react-router-dom'
import { financeClient } from '../api/localClient'
import type { TipoTransacao } from '../api/types'
import { currentMonth, decimalToCents, formatMoney, monthLabel, shortMonthLabel } from '../lib/format'

function percentage(current: string, previous: string): string {
  const currentValue = decimalToCents(current)
  const previousValue = decimalToCents(previous)
  if (previousValue === 0) return currentValue === 0 ? '0%' : 'Novo'
  const variation = ((currentValue - previousValue) / Math.abs(previousValue)) * 100
  return `${variation >= 0 ? '+' : ''}${variation.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export function RelatoriosPage() {
  const [search, setSearch] = useSearchParams()
  const fallback = currentMonth()
  const monthValue = search.get('mes') ?? `${fallback.ano}-${String(fallback.mes).padStart(2, '0')}`
  const [ano, mes] = monthValue.split('-').map(Number)
  const tipo = (search.get('tipo') as TipoTransacao | null) ?? 'despesa'

  const pizza = useQuery({
    queryKey: ['relatorios', 'pizza', ano, mes, tipo],
    queryFn: () => financeClient.obterPizza(ano, mes, tipo),
  })
  const evolution = useQuery({
    queryKey: ['relatorios', 'evolucao', 6],
    queryFn: () => financeClient.obterEvolucao(6),
  })
  const comparison = useQuery({
    queryKey: ['relatorios', 'comparativo', ano, mes],
    queryFn: () => financeClient.obterComparativo(ano, mes),
  })

  const pieData = pizza.data?.map((slice) => ({ ...slice, value: decimalToCents(slice.total) / 100 })) ?? []
  const lineData = evolution.data?.map((point) => ({
    label: shortMonthLabel(point.ano, point.mes),
    receitas: decimalToCents(point.totalReceitas) / 100,
    despesas: decimalToCents(point.totalDespesas) / 100,
    ...point,
  })) ?? []
  const isPending = pizza.isPending || evolution.isPending || comparison.isPending
  const isError = pizza.isError || evolution.isError || comparison.isError

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(search)
    next.set(key, value)
    setSearch(next)
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div><p className="eyebrow">US5 · ANÁLISE</p><h1>Relatórios</h1><p className="subtitle">Compare períodos e descubra para onde seu dinheiro está indo.</p></div>
        <div className="report-selectors">
          <label className="field inline-field"><span>Mês</span><input type="month" value={monthValue} onChange={(event) => updateParam('mes', event.target.value)} /></label>
          <label className="field inline-field"><span>Visualizar</span><select value={tipo} onChange={(event) => updateParam('tipo', event.target.value)}><option value="despesa">Despesas</option><option value="receita">Receitas</option></select></label>
        </div>
      </section>

      {isPending && <div className="loading-state panel">Calculando relatórios…</div>}
      {isError && <div className="alert error">Não foi possível calcular os relatórios.</div>}

      {!isPending && !isError && (
        <>
          <section className="comparison-grid" aria-label={`Comparativo de ${monthLabel(ano, mes)}`}>
            <article className="comparison-card"><span>Receitas</span><strong>{formatMoney(comparison.data?.atual.totalReceitas ?? '0')}</strong><small>{percentage(comparison.data?.atual.totalReceitas ?? '0', comparison.data?.anterior.totalReceitas ?? '0')} vs. mês anterior</small></article>
            <article className="comparison-card"><span>Despesas</span><strong>{formatMoney(comparison.data?.atual.totalDespesas ?? '0')}</strong><small>{percentage(comparison.data?.atual.totalDespesas ?? '0', comparison.data?.anterior.totalDespesas ?? '0')} vs. mês anterior</small></article>
            <article className="comparison-card"><span>Saldo</span><strong>{formatMoney(comparison.data?.atual.saldo ?? '0')}</strong><small>{formatMoney(comparison.data?.variacaoSaldo ?? '0')} de variação</small></article>
          </section>

          <section className="reports-grid">
            <article className="panel chart-card">
              <div className="panel-heading"><div><h2>{tipo === 'despesa' ? 'Despesas' : 'Receitas'} por categoria</h2><p>{monthLabel(ano, mes)}</p></div></div>
              {pieData.length === 0 ? (
                <div className="empty-state"><BarChart3 /><h3>Sem dados para este mês</h3><p>Cadastre transações ou escolha outro período.</p></div>
              ) : (
                <>
                  <div className="chart-container" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="nome" innerRadius={58} outerRadius={92} paddingAngle={2}>
                          {pieData.map((entry) => <Cell key={entry.categoriaId} fill={entry.cor} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatMoney(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="accessible-data">
                    <h3>Dados do gráfico por categoria</h3>
                    <table><thead><tr><th>Categoria</th><th className="align-right">Total</th></tr></thead><tbody>{pieData.map((entry) => <tr key={entry.categoriaId}><td><span className="category-pill"><i style={{ background: entry.cor }} />{entry.nome}</span></td><td className="align-right">{formatMoney(entry.total)}</td></tr>)}</tbody></table>
                  </div>
                </>
              )}
            </article>

            <article className="panel chart-card line-chart-card">
              <div className="panel-heading"><div><h2>Evolução mensal</h2><p>Receitas e despesas nos últimos 6 meses</p></div></div>
              <div className="chart-container wide-chart" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${Number(value) / 1000}k`} />
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#238C66" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#D97757" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="accessible-data">
                <h3>Dados da evolução mensal</h3>
                <table><thead><tr><th>Mês</th><th className="align-right">Receitas</th><th className="align-right">Despesas</th></tr></thead><tbody>{lineData.map((point) => <tr key={`${point.ano}-${point.mes}`}><td>{monthLabel(point.ano, point.mes)}</td><td className="align-right">{formatMoney(point.totalReceitas)}</td><td className="align-right">{formatMoney(point.totalDespesas)}</td></tr>)}</tbody></table>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
