import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { financeClient } from '../api/client'
import type { TipoTransacao } from '../api/types'
import { ComparativoMes } from '../components/comparativo-mes'
import { GraficoLinha } from '../components/grafico-linha'
import { GraficoPizza } from '../components/grafico-pizza'
import { currentMonth, decimalToCents, monthLabel, shortMonthLabel } from '../lib/format'

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

  const pieData = pizza.data?.map((slice) => ({
    id: slice.categoriaId,
    name: slice.nome,
    color: slice.cor,
    value: decimalToCents(slice.total) / 100,
  })) ?? []
  const lineData = evolution.data?.map((point) => ({
    key: `${point.ano}-${point.mes}`,
    label: shortMonthLabel(point.ano, point.mes),
    income: decimalToCents(point.totalReceitas) / 100,
    expenses: decimalToCents(point.totalDespesas) / 100,
  })) ?? []
  const isPending = pizza.isPending || evolution.isPending || comparison.isPending
  const isError = pizza.isError || evolution.isError || comparison.isError
  const typeLabel = tipo === 'despesa' ? 'despesas' : 'receitas'
  const previousMonth = comparison.data
    ? { ano: comparison.data.anterior.ano, mes: comparison.data.anterior.mes }
    : null

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

      {!isPending && !isError && comparison.data && previousMonth && (
        <>
          <ComparativoMes
            current={{
              income: comparison.data.atual.totalReceitas,
              expenses: comparison.data.atual.totalDespesas,
              balance: comparison.data.atual.saldo,
            }}
            previous={{
              income: comparison.data.anterior.totalReceitas,
              expenses: comparison.data.anterior.totalDespesas,
              balance: comparison.data.anterior.saldo,
            }}
            currentLabel={monthLabel(ano, mes)}
            previousLabel={monthLabel(previousMonth.ano, previousMonth.mes)}
          />

          <section className="reports-grid">
            <GraficoPizza
              data={pieData}
              title={`${tipo === 'despesa' ? 'Despesas' : 'Receitas'} por categoria`}
              subtitle={monthLabel(ano, mes)}
              typeLabel={typeLabel}
            />
            <GraficoLinha data={lineData} subtitle="Receitas e despesas nos últimos 6 meses" />
          </section>
        </>
      )}
    </div>
  )
}
