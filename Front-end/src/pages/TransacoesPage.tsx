import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Download, Filter, Pencil, Plus, ReceiptText, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { financeClient } from '../api/localClient'
import { transacaoFormSchema } from '../api/schemas'
import type { TransacaoFormValues } from '../api/schemas'
import type { Categoria, FiltrosTransacao, TipoTransacao, Transacao, TransacaoInput } from '../api/types'
import { currentMonth, formatDate, formatMoney, monthBounds, todayInSaoPaulo } from '../lib/format'
import { ApiError, api } from '../lib/api-client'

function defaultPeriod() {
  const { ano, mes } = currentMonth()
  return monthBounds(ano, mes)
}

function queryFilters(search: URLSearchParams): FiltrosTransacao {
  const defaults = defaultPeriod()
  return {
    page: Math.max(1, Number(search.get('page') ?? 1)),
    pageSize: 20,
    from: search.get('from') ?? defaults.from,
    to: search.get('to') ?? defaults.to,
    tipo: (search.get('tipo') as TipoTransacao | null) ?? undefined,
    categoriaId: search.get('categoriaId') ?? undefined,
    minValor: search.get('minValor') ?? undefined,
    maxValor: search.get('maxValor') ?? undefined,
  }
}

type TransactionFormProps = {
  transaction?: Transacao
  categories: Categoria[]
  onClose: () => void
  onSaved: (message: string) => void
}

function TransactionForm({ transaction, categories, onClose, onSaved }: TransactionFormProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, control, formState: { errors } } = useForm<TransacaoFormValues>({
    resolver: zodResolver(transacaoFormSchema),
    defaultValues: transaction
      ? { descricao: transaction.descricao, valor: transaction.valor, data: transaction.data, tipo: transaction.tipo, categoriaId: transaction.categoriaId }
      : { descricao: '', valor: '', data: todayInSaoPaulo(), tipo: 'despesa', categoriaId: '' },
  })
  const selectedType = useWatch({ control, name: 'tipo' })
  const compatibleCategories = categories.filter((category) => category.tipo === 'ambos' || category.tipo === selectedType)
  const mutation = useMutation({
    mutationFn: (values: TransacaoFormValues) => {
      const input: TransacaoInput = { ...values, valor: Number(values.valor.replace(',', '.')) }
      return transaction
        ? financeClient.atualizarTransacao(transaction.id, input)
        : financeClient.criarTransacao(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transacoes'] }),
        queryClient.invalidateQueries({ queryKey: ['resumo'] }),
        queryClient.invalidateQueries({ queryKey: ['relatorios'] }),
      ])
      onSaved(transaction ? 'Transação atualizada' : 'Transação criada')
      onClose()
    },
  })

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal" aria-label={transaction ? 'Editar transação' : 'Nova transação'} onSubmit={handleSubmit((values) => mutation.mutate(values))} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div><p className="eyebrow">MOVIMENTO FINANCEIRO</p><h2>{transaction ? 'Editar lançamento' : 'Novo lançamento'}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="type-switch">
          <label><input type="radio" value="despesa" {...register('tipo')} /><span>Despesa</span></label>
          <label><input type="radio" value="receita" {...register('tipo')} /><span>Receita</span></label>
        </div>
        <label className="field">
          <span>Descrição</span>
          <input autoFocus {...register('descricao')} placeholder="Ex.: Mercado do bairro" aria-invalid={!!errors.descricao} />
          {errors.descricao && <small className="field-error">{errors.descricao.message}</small>}
        </label>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Valor</span>
            <div className="money-input"><span>R$</span><input inputMode="decimal" {...register('valor')} placeholder="0,00" aria-invalid={!!errors.valor} /></div>
            {errors.valor && <small className="field-error">{errors.valor.message}</small>}
          </label>
          <label className="field">
            <span>Data</span>
            <input type="date" {...register('data')} aria-invalid={!!errors.data} />
            {errors.data && <small className="field-error">{errors.data.message}</small>}
          </label>
        </div>
        <label className="field">
          <span>Categoria</span>
          <select {...register('categoriaId')} aria-invalid={!!errors.categoriaId}>
            <option value="">Selecione</option>
            {compatibleCategories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
          </select>
          {errors.categoriaId && <small className="field-error">{errors.categoriaId.message}</small>}
        </label>
        {mutation.isError && <div className="alert error">{mutation.error.message}</div>}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="primary-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando…' : 'Salvar lançamento'}</button>
        </div>
      </form>
    </div>
  )
}

export function TransacoesPage() {
  const [search, setSearch] = useSearchParams()
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()
  const filters = queryFilters(search)
  const categories = useQuery({ queryKey: ['categorias'], queryFn: () => financeClient.listarCategorias() })
  const transactions = useQuery({
    queryKey: ['transacoes', filters],
    queryFn: () => financeClient.listarTransacoes(filters),
  })
  const editingId = search.get('editar')
  const editing = transactions.data?.items.find((item) => item.id === editingId)
  const creating = search.get('novo') === '1'
  const deletingId = search.get('excluir')
  const deleting = transactions.data?.items.find((item) => item.id === deletingId)

  function updateSearch(values: Record<string, string | undefined>) {
    const next = new URLSearchParams(search)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearch(next)
  }

  function closeModal() {
    updateSearch({ novo: undefined, editar: undefined, excluir: undefined })
  }

  function showNotice(message: string) {
    closeModal()
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    for (const key of ['from', 'to', 'tipo', 'categoriaId', 'minValor', 'maxValor']) {
      const value = String(data.get(key) ?? '')
      if (value) next.set(key, value)
    }
    setSearch(next)
  }

  function clearFilters() {
    const period = defaultPeriod()
    setSearch({ from: period.from, to: period.to })
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeClient.excluirTransacao(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transacoes'] }),
        queryClient.invalidateQueries({ queryKey: ['resumo'] }),
        queryClient.invalidateQueries({ queryKey: ['relatorios'] }),
      ])
      showNotice('Transação excluída')
    },
  })

  const pageCount = Math.max(1, Math.ceil((transactions.data?.total ?? 0) / 20))

  async function exportarCsv() {
    try {
      const arquivo = await api.exportarCsv()
      const url = URL.createObjectURL(arquivo)
      const link = document.createElement('a')
      link.href = url
      link.download = 'transacoes.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      showNotice(error instanceof ApiError && error.status === 401 ? 'Sessão expirada. Entre novamente.' : 'Não foi possível exportar o CSV.')
    }
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div><p className="eyebrow">US2 E US4 · HISTÓRICO</p><h1>Transações</h1><p className="subtitle">Registre e encontre cada entrada e saída do seu dinheiro.</p></div>
        <div className="page-actions"><button className="secondary-button" type="button" onClick={exportarCsv}><Download size={16} /> Exportar CSV</button><button className="primary-button" type="button" onClick={() => updateSearch({ novo: '1' })}><Plus size={17} /> Novo lançamento</button></div>
      </section>

      <form className="panel filter-panel" onSubmit={applyFilters}>
        <div className="filter-title"><Filter size={17} /><strong>Filtros</strong></div>
        <div className="filters-grid">
          <label className="field"><span>De</span><input name="from" type="date" defaultValue={filters.from} /></label>
          <label className="field"><span>Até</span><input name="to" type="date" defaultValue={filters.to} /></label>
          <label className="field"><span>Tipo</span><select name="tipo" defaultValue={filters.tipo ?? ''}><option value="">Todos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select></label>
          <label className="field"><span>Categoria</span><select name="categoriaId" defaultValue={filters.categoriaId ?? ''}><option value="">Todas</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label>
          <label className="field"><span>Valor mínimo</span><input name="minValor" inputMode="decimal" defaultValue={filters.minValor ?? ''} placeholder="0,00" /></label>
          <label className="field"><span>Valor máximo</span><input name="maxValor" inputMode="decimal" defaultValue={filters.maxValor ?? ''} placeholder="0,00" /></label>
        </div>
        <div className="filter-actions"><button className="text-button" type="button" onClick={clearFilters}>Limpar filtros</button><button className="secondary-button" type="submit">Aplicar filtros</button></div>
      </form>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div><h2>Histórico</h2><p>{transactions.data?.total ?? 0} lançamento(s) encontrado(s)</p></div>
        </div>
        {transactions.isPending && <div className="loading-state">Carregando transações…</div>}
        {transactions.isError && <div className="alert error">Não foi possível carregar as transações.</div>}
        {transactions.data?.items.length === 0 && <div className="empty-state"><ReceiptText /><h3>Nenhum lançamento neste período</h3><p>Ajuste os filtros ou cadastre uma nova transação.</p></div>}
        {!!transactions.data?.items.length && (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Descrição</th><th>Data</th><th>Categoria</th><th>Tipo</th><th className="align-right">Valor</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {transactions.data.items.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><strong>{transaction.descricao}</strong></td>
                    <td>{formatDate(transaction.data)}</td>
                    <td><span className="category-pill"><i style={{ background: transaction.categoria?.cor }} />{transaction.categoria?.nome ?? 'Sem categoria'}</span></td>
                    <td><span className={`type-badge ${transaction.tipo}`}>{transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                    <td className={`align-right money ${transaction.tipo}`}>{transaction.tipo === 'receita' ? '+' : '−'} {formatMoney(transaction.valor)}</td>
                    <td><div className="row-actions"><button className="icon-button" type="button" onClick={() => updateSearch({ editar: transaction.id })} aria-label={`Editar ${transaction.descricao}`}><Pencil size={16} /></button><button className="icon-button danger-button" type="button" onClick={() => updateSearch({ excluir: transaction.id })} aria-label={`Excluir ${transaction.descricao}`}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <button className="secondary-button square-button" type="button" disabled={filters.page === 1} onClick={() => updateSearch({ page: String((filters.page ?? 1) - 1) })} aria-label="Página anterior"><ChevronLeft /></button>
          <span>Página {filters.page} de {pageCount}</span>
          <button className="secondary-button square-button" type="button" disabled={filters.page === pageCount} onClick={() => updateSearch({ page: String((filters.page ?? 1) + 1) })} aria-label="Próxima página"><ChevronRight /></button>
        </div>
      </section>

      {(creating || editing) && categories.data && <TransactionForm key={editing?.id ?? 'new'} transaction={editing} categories={categories.data} onClose={closeModal} onSaved={showNotice} />}
      {deleting && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-transaction-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="delete-transaction-title">Excluir “{deleting.descricao}”?</h2>
            <p>Essa ação remove o lançamento dos resumos e relatórios. Não é possível desfazer.</p>
            {deleteMutation.isError && <div className="alert error">{deleteMutation.error.message}</div>}
            <div className="modal-actions"><button className="secondary-button" type="button" onClick={closeModal}>Cancelar</button><button className="danger-solid-button" type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleting.id)}>{deleteMutation.isPending ? 'Excluindo…' : 'Confirmar exclusão'}</button></div>
          </div>
        </div>
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}
