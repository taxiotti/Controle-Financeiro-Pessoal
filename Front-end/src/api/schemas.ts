import { z } from 'zod'

const moneyInput = z
  .string()
  .trim()
  .min(1, 'Informe o valor')
  .refine((value) => {
    const normalized = value.replace(',', '.')
    const number = Number(normalized)
    return Number.isFinite(number) && number > 0 && /^\d+(?:[.,]\d{1,2})?$/.test(value.trim())
  }, 'Use um valor maior que zero, com até 2 casas decimais')

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2, 'Use pelo menos 2 caracteres').max(40, 'Use no máximo 40 caracteres'),
  tipo: z.enum(['receita', 'despesa', 'ambos']),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Selecione uma cor válida'),
  icone: z.string().min(1, 'Selecione um ícone'),
})

export const transacaoFormSchema = z.object({
  descricao: z.string().trim().min(1, 'Informe a descrição').max(120, 'Use no máximo 120 caracteres'),
  valor: moneyInput,
  data: z.iso.date('Informe uma data válida'),
  tipo: z.enum(['receita', 'despesa']),
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
})

export type CategoriaFormValues = z.infer<typeof categoriaSchema>
export type TransacaoFormValues = z.infer<typeof transacaoFormSchema>
