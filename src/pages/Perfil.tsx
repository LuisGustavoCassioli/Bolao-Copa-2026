import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { PalpiteComJogo } from '../types'

function getInitials(nome: string): string {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function PerfilPage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [palpites, setPalpites] = useState<PalpiteComJogo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNome, setEditingNome] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(profile?.nome ?? '')
  const [savingNome, setSavingNome] = useState(false)
  const [nomeFeedback, setNomeFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchPalpites()
  }, [user])

  useEffect(() => {
    if (profile) setNomeEdit(profile.nome)
  }, [profile])

  async function fetchPalpites() {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('palpites')
      .select('*, jogo:jogos!palpites_jogo_id_fkey(*)')
      .eq('user_id', user.id)
      .order('jogo_id', { ascending: false })

    if (error) {
      console.error('[PERFIL-001]', error.message)
    } else {
      setPalpites((data ?? []) as PalpiteComJogo[])
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  async function handleSaveNome() {
    if (!nomeEdit.trim() || !user) return
    setSavingNome(true)
    const { error } = await supabase
      .from('profiles')
      .update({ nome: nomeEdit.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      setNomeFeedback('Erro ao atualizar nome')
    } else {
      await refreshProfile()
      setEditingNome(false)
      setNomeFeedback(null)
    }
    setSavingNome(false)
  }

  const totalPontos = palpites.reduce((acc, p) => acc + (p.pontos ?? 0), 0)
  const acertos = palpites.filter(p => p.pontos > 0).length
  const finalizados = palpites.filter(p => p.jogo?.status === 'finalizado').length

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="section-title mb-6">👤 Meu Perfil</h1>

      {/* Profile card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-verde flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {getInitials(profile.nome)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editingNome ? (
              <div className="flex items-center gap-2">
                <input
                  id="input-nome-edit"
                  value={nomeEdit}
                  onChange={e => setNomeEdit(e.target.value)}
                  className="input-field text-sm py-2"
                  autoFocus
                />
                <button
                  id="btn-save-nome"
                  onClick={handleSaveNome}
                  disabled={savingNome}
                  className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
                >
                  {savingNome ? '...' : 'Salvar'}
                </button>
                <button
                  id="btn-cancel-nome"
                  onClick={() => { setEditingNome(false); setNomeEdit(profile.nome) }}
                  className="btn-secondary text-sm px-3 py-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white truncate">{profile.nome}</h2>
                <button
                  id="btn-edit-nome"
                  onClick={() => setEditingNome(true)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Editar nome"
                >
                  ✎
                </button>
              </div>
            )}
            {nomeFeedback && <p className="text-red-400 text-xs mt-1">{nomeFeedback}</p>}
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {profile.is_admin && <span className="badge badge-amarelo mt-1">⚙️ Admin</span>}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-dark-border">
          <div className="text-center">
            <p className="font-display font-black text-3xl text-amarelo">{totalPontos}</p>
            <p className="text-xs text-gray-500 mt-1">pontos</p>
          </div>
          <div className="text-center">
            <p className="font-display font-black text-3xl text-verde-light">{acertos}</p>
            <p className="text-xs text-gray-500 mt-1">acertos</p>
          </div>
          <div className="text-center">
            <p className="font-display font-black text-3xl text-white">{palpites.length}</p>
            <p className="text-xs text-gray-500 mt-1">palpites</p>
          </div>
        </div>

        {palpites.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <div className="flex-1 bg-dark-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-verde h-full rounded-full transition-all duration-500"
                style={{ width: `${finalizados ? Math.round((acertos / finalizados) * 100) : 0}%` }}
              />
            </div>
            <span>
              {finalizados ? Math.round((acertos / finalizados) * 100) : 0}% de aproveitamento
            </span>
          </div>
        )}
      </div>

      {/* History */}
      <h2 className="font-display font-bold text-lg text-gray-400 uppercase tracking-wide mb-3">
        Histórico de palpites
      </h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : palpites.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-3xl mb-2">⚽</p>
          <p>Você ainda não fez palpites.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {palpites.map(p => {
            const jogo = p.jogo
            if (!jogo) return null
            const isFinalizado = jogo.status === 'finalizado'
            return (
              <div
                key={p.id}
                className={`card flex items-center gap-4 ${
                  isFinalizado && p.pontos > 0 ? 'border-verde/30 bg-verde/5' : ''
                }`}
              >
                {/* Jogo info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {jogo.time_casa} × {jogo.time_fora}
                  </p>
                  <p className="text-xs text-gray-500">{jogo.data} · {jogo.grupo ? `Grupo ${jogo.grupo}` : jogo.fase}</p>
                </div>

                {/* Palpite */}
                <div className="text-center">
                  <p className="font-display font-bold text-sm text-gray-300">
                    {p.palpite_casa} — {p.palpite_fora}
                  </p>
                  <p className="text-xs text-gray-500">palpite</p>
                </div>

                {/* Result */}
                {isFinalizado && jogo.placar_casa !== null ? (
                  <div className="text-center">
                    <p className="font-display font-bold text-sm text-amarelo">
                      {jogo.placar_casa} — {jogo.placar_fora}
                    </p>
                    <p className="text-xs text-gray-500">resultado</p>
                  </div>
                ) : (
                  <span className="badge badge-gray text-xs">{jogo.status === 'agendado' ? '⏳' : '❓'}</span>
                )}

                {/* Points */}
                {isFinalizado && (
                  <span className={`badge flex-shrink-0 ${p.pontos > 0 ? 'badge-verde' : 'badge-gray'}`}>
                    {p.pontos > 0 ? '+1pt' : '0pt'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Sign out */}
      <div className="mt-10 pt-6 border-t border-dark-border text-center">
        <button
          id="btn-signout-perfil"
          onClick={handleSignOut}
          className="btn-secondary text-sm px-8"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
