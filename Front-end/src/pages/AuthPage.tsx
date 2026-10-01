import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../lib/api-client'
import { getUsuario, setSessao } from '../lib/session'

type AuthMode = 'login' | 'register'

export function AuthPage({ mode }: { mode: AuthMode }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const cadastro = mode === 'register'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const sessao = cadastro ? await api.register(nome, email, senha) : await api.login(email, senha)
      setSessao(sessao.accessToken, sessao.usuario)
      navigate('/', { replace: true })
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (getUsuario()) return <Navigate to="/" replace />

  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title">
    <div className="auth-brand"><span className="brand-mark">$</span><span>Daniel Bank</span></div>
    <p className="eyebrow">CONTROLE FINANCEIRO PESSOAL</p>
    <h1 id="auth-title">{cadastro ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
    <p className="auth-subtitle">{cadastro ? 'Comece a organizar sua vida financeira.' : 'Acesse seus dados financeiros com segurança.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {cadastro && <label>Nome<input required minLength={2} maxLength={80} value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" /></label>}
      <label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
      <label>Senha<input required type="password" minLength={cadastro ? 8 : 1} maxLength={128} value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete={cadastro ? 'new-password' : 'current-password'} /></label>
      {erro && <p className="auth-error" role="alert">{erro}</p>}
      <button className="primary-button" disabled={enviando} type="submit">{enviando ? 'Aguarde…' : cadastro ? 'Criar conta' : 'Entrar'}</button>
    </form>
    <p className="auth-switch">{cadastro ? 'Já possui uma conta?' : 'Ainda não possui uma conta?'} <Link to={cadastro ? '/login' : '/register'}>{cadastro ? 'Entrar' : 'Cadastre-se'}</Link></p>
  </section></main>
}
