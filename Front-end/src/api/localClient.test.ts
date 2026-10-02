// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { financeClient } from './localClient'

describe('local finance client', () => {
  beforeEach(() => localStorage.clear())

  it('inicializa as nove categorias e permite excluir uma sem uso', async () => {
    const categories = await financeClient.listarCategorias()
    expect(categories).toHaveLength(9)
    await financeClient.excluirCategoria(categories[0].id)
    await expect(financeClient.listarCategorias()).resolves.toHaveLength(8)
  })

  it('aplica regras de categoria, persiste transações e calcula relatórios', async () => {
    const categories = await financeClient.listarCategorias()
    const salary = categories.find((category) => category.nome === 'Salário')!
    const food = categories.find((category) => category.nome === 'Alimentação')!

    await expect(financeClient.criarTransacao({
      tipo: 'despesa',
      valor: 100,
      descricao: 'Tipo incompatível',
      data: '2026-09-10',
      categoriaId: salary.id,
    })).rejects.toThrow('compatível')

    await financeClient.criarTransacao({
      tipo: 'receita',
      valor: 5000,
      descricao: 'Salário',
      data: '2026-09-05',
      categoriaId: salary.id,
    })
    await financeClient.criarTransacao({
      tipo: 'despesa',
      valor: 250.45,
      descricao: 'Mercado',
      data: '2026-09-10',
      categoriaId: food.id,
    })

    const summary = await financeClient.obterResumo(2026, 9)
    expect(summary).toMatchObject({
      totalReceitas: '5000.00',
      totalDespesas: '250.45',
      saldo: '4749.55',
    })
    const pie = await financeClient.obterPizza(2026, 9, 'despesa')
    expect(pie).toEqual([expect.objectContaining({ nome: 'Alimentação', total: '250.45' })])
  })

  it('filtra antes de paginar e impede excluir categoria em uso', async () => {
    const category = await financeClient.criarCategoria({
      nome: 'Pets',
      tipo: 'despesa',
    })
    for (let index = 0; index < 21; index += 1) {
      await financeClient.criarTransacao({
        tipo: 'despesa',
        valor: index + 1,
        descricao: `Compra ${index + 1}`,
        data: '2026-09-10',
        categoriaId: category.id,
      })
    }
    const page = await financeClient.listarTransacoes({ categoriaId: category.id, minValor: '10.00', page: 2, pageSize: 5 })
    expect(page.total).toBe(12)
    expect(page.items).toHaveLength(5)
    await expect(financeClient.excluirCategoria(category.id)).rejects.toThrow('vinculada')
  })

  it('exporta todas as transações filtradas em CSV compatível com Excel', async () => {
    const categories = await financeClient.listarCategorias()
    const food = categories.find((category) => category.nome === 'Alimentação')!
    const salary = categories.find((category) => category.nome === 'Salário')!
    await financeClient.criarTransacao({ tipo: 'despesa', valor: 12.5, descricao: 'Mercado; semanal', data: '2026-09-20', categoriaId: food.id })
    await financeClient.criarTransacao({ tipo: 'receita', valor: 2000, descricao: 'Salário', data: '2026-09-21', categoriaId: salary.id })

    const csv = await financeClient.exportarTransacoes({ tipo: 'despesa' })

    await expect(csv.text()).resolves.toBe(
      'Descrição;Data;Categoria;Tipo;Valor\r\n"Mercado; semanal";20/09/2026;Alimentação;Despesa;12,50\r\n',
    )
  })
})
