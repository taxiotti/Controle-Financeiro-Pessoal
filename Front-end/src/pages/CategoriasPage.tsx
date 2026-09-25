import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Car, ChartNoAxesCombined, Gamepad2, GraduationCap, HeartPulse, House, Pencil, Plus,
  Shapes, Trash2, Utensils, Wallet, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { financeClient } from '../api/localClient'
import { categoriaSchema } from '../api/schemas'
import type { CategoriaFormValues } from '../api/schemas'
import type { Categoria } from '../api/types'

const icons: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  house: House,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  gamepad: Gamepad2,
  wallet: Wallet,
  chart: ChartNoAxesCombined,
  shapes: Shapes,
}

const iconOptions = Object.keys(icons)

function CategoryIcon({ name }: { name: string }) {
  const Icon = icons[name] ?? Shapes
  return <Icon size={19} aria-hidden="true" />
}

type FormProps = {
  category?: Categoria
  onClose: () => void
  onSaved: (message: string) => void
}

function CategoryForm({ category, onClose, onSaved }: FormProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: category
      ? { nome: category.nome, tipo: category.tipo, cor: category.cor, icone: category.icone }
      : { nome: '', tipo: 'despesa', cor: '#238C66', icone: 'shapes' },
  })
  const mutation = useMutation({
    mutationFn: (values: CategoriaFormValues) => category
      ? financeClient.atualizarCategoria(category.id, values)
      : financeClient.criarCategoria(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
      onSaved(category ? 'Categoria atualizada' : 'Categoria criada')
      onClose()
    },
  })

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal" aria-label={category ? 'Editar categoria' : 'Nova categoria'} onSubmit={handleSubmit((values) => mutation.mutate(values))} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div><p className="eyebrow">ORGANIZAÇÃO</p><h2>{category ? 'Editar categoria' : 'Nova categoria'}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <label className="field">
          <span>Nome</span>
          <input autoFocus {...register('nome')} placeholder="Ex.: Pets" aria-invalid={!!errors.nome} />
          {errors.nome && <small className="field-error">{errors.nome.message}</small>}
        </label>
        <label className="field">
          <span>Tipo</span>
          <select {...register('tipo')}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
            <option value="ambos">Receita e despesa</option>
          </select>
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Cor</span>
            <input className="color-input" type="color" {...register('cor')} />
          </label>
          <fieldset className="field icon-picker">
            <legend>Ícone</legend>
            <div>
              {iconOptions.map((icon) => (
                <label key={icon}>
                  <input type="radio" value={icon} {...register('icone')} />
                  <span><CategoryIcon name={icon} /></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {mutation.isError && <div className="alert error">{mutation.error.message}</div>}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="primary-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando…' : 'Salvar categoria'}</button>
        </div>
      </form>
    </div>
  )
}

export function CategoriasPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Categoria | null>(null)
  const [notice, setNotice] = useState('')
  const categories = useQuery({ queryKey: ['categorias'], queryFn: () => financeClient.listarCategorias() })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeClient.excluirCategoria(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setDeleting(null)
      showNotice('Categoria excluída')
    },
  })

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div><p className="eyebrow">US1 · CATEGORIAS</p><h1>Organize seus lançamentos</h1><p className="subtitle">Use as categorias padrão ou crie grupos que façam sentido para você.</p></div>
        <button className="primary-button" type="button" onClick={() => setCreating(true)}><Plus size={17} /> Nova categoria</button>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><h2>Categorias</h2><p>Padrões ficam protegidas; categorias em uso não podem ser excluídas.</p></div></div>
        {categories.isPending && <div className="loading-state">Carregando categorias…</div>}
        {categories.isError && <div className="alert error">Não foi possível carregar as categorias.</div>}
        <div className="category-grid">
          {categories.data?.map((category) => (
            <article className="category-card" key={category.id}>
              <span className="category-icon" style={{ color: category.cor, backgroundColor: `${category.cor}18` }}><CategoryIcon name={category.icone} /></span>
              <div className="category-copy">
                <strong>{category.nome}</strong>
                <span>{category.tipo === 'ambos' ? 'Receita e despesa' : category.tipo === 'receita' ? 'Receita' : 'Despesa'}</span>
              </div>
              {category.padrao && <span className="badge">Padrão</span>}
              <div className="row-actions">
                <button className="icon-button" type="button" onClick={() => setEditing(category)} disabled={category.padrao} title={category.padrao ? 'Categorias padrão não são editáveis' : 'Editar'} aria-label={`Editar ${category.nome}`}><Pencil size={16} /></button>
                <button className="icon-button danger-button" type="button" onClick={() => setDeleting(category)} aria-label={`Excluir ${category.nome}`}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {(creating || editing) && <CategoryForm category={editing ?? undefined} onClose={() => { setCreating(false); setEditing(null) }} onSaved={showNotice} />}
      {deleting && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleting(null)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="delete-category-title">Excluir “{deleting.nome}”?</h2>
            <p>{deleting.padrao ? 'Esta é uma categoria padrão e sua exclusão será bloqueada.' : 'A exclusão só será concluída se não houver transações vinculadas.'}</p>
            {deleteMutation.isError && <div className="alert error">{deleteMutation.error.message}</div>}
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setDeleting(null)}>Cancelar</button>
              <button className="danger-solid-button" type="button" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Excluindo…' : 'Confirmar exclusão'}</button>
            </div>
          </div>
        </div>
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}
