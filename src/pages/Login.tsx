import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Maps raw Supabase/GoTrue error messages → friendly PT-BR messages
const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
  'User already registered': 'Este e-mail já está cadastrado. Tente entrar.',
  'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de e-mail inválido.',
  'signup is disabled': 'Novos cadastros estão desabilitados. Fale com o administrador.',
}

function translateAuthError(msg: string): string {
  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (msg.includes(key)) return value
  }
  return 'Ocorreu um erro. Tente novamente.'
}

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // true when signup succeeded but email confirmation is still pending
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const { signIn, signUp, user } = useAuth()


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const errorMsg = await signIn(email, password)
      if (errorMsg) {
        setError(translateAuthError(errorMsg))
      }
      // navigation handled by App.tsx when session is established
    } else {
      if (!nome.trim()) {
        setError('Informe seu nome.')
        setLoading(false)
        return
      }
      const errorMsg = await signUp(email, password, nome.trim())
      if (errorMsg) {
        setError(translateAuthError(errorMsg))
      } else if (!user) {
        // Signup succeeded but session not yet active → email confirmation required
        setPendingConfirmation(true)
      }
      // if user is already set (email confirm disabled), App.tsx redirects automatically
    }

    setLoading(false)
  }

  if (pendingConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="card w-full max-w-md text-center animate-fade-in">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Confirme seu e-mail</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.<br />
            Clique no link e depois volte aqui para entrar.
          </p>
          <button
            id="btn-go-to-login"
            onClick={() => { setPendingConfirmation(false); setMode('login'); setPassword('') }}
            className="btn-primary w-full"
          >
            Já confirmei — Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo area */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase gradient-text">
          Bolão Copa 2026
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Faça seus palpites e dispute com seus amigos ⚽
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-md animate-slide-up">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-dark-border mb-6">
          <button
            id="btn-tab-login"
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'login' ? 'bg-verde text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            id="btn-tab-signup"
            onClick={() => { setMode('signup'); setError(null) }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'signup' ? 'bg-verde text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <div>
              <label htmlFor="input-nome" className="block text-sm text-gray-400 mb-1.5">
                Seu nome
              </label>
              <input
                id="input-nome"
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="input-field"
                placeholder="Como você quer aparecer no ranking"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label htmlFor="input-email" className="block text-sm text-gray-400 mb-1.5">
              E-mail
            </label>
            <input
              id="input-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="input-password" className="block text-sm text-gray-400 mb-1.5">
              Senha
            </label>
            <input
              id="input-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3" role="alert">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Não tem conta?{' '}
            <button
              id="btn-switch-to-signup"
              onClick={() => { setMode('signup'); setError(null) }}
              className="text-verde-light hover:underline font-medium"
            >
              Criar agora
            </button>
          </p>
        )}
      </div>

      <p className="text-gray-600 text-xs mt-8">
        <Link to="/ranking" className="hover:text-gray-400 transition-colors">
          Ver ranking público →
        </Link>
      </p>
    </div>
  )
}
