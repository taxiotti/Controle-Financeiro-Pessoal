import type { FinanceClient } from './types'
import { httpFinanceClient } from './httpClient'
import { localFinanceClient } from './localClient'

const useHttpApi = import.meta.env.MODE !== 'test' && import.meta.env.VITE_USE_API !== 'false'

export const financeClient: FinanceClient = useHttpApi ? httpFinanceClient : localFinanceClient
