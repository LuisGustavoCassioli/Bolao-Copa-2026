import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useJogos } from '../hooks/useJogos'
import { AdminResultForm } from '../components/AdminResultForm'

type StatusFilter = 'todos' | 'agendado' | 'finalizado' | 'a_definir'

export default function AdminPage() {
  const { profile } = useAuth()
  const { jogos, loading, error, refetch } = useJogos()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  if (!profile?.is_admin) {
    return <Navigate to="/jogos" replace />
  }

  const filtered = useMemo(() => {
    let list = jogos

    if (statusFilter !== 'todos') {
      list = list.filter(j => j.status === statusFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter(j =>
        j.time_casa?.toLowerCase().includes(term) ||
        j.time_fora?.toLowerCase().includes(term) ||
        j.sede?.toLowerCase().includes(term) ||
        String(j.jogo_id).includes(term)
      )
    }

    return list
  }, [jogos, statusFilter, searchTerm])

  const counts = useMemo(() => ({
    total: jogos.length,
    agendado: jogos.filter(j => j.status === 'agendado').length,
    finalizado: jogos.filter(j => j.status === 'finalizado').length,
    a_definir: jogos.filter(j => j.status === 'a_definir').length,
  }), [jogos])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="section-title">⚙️ Admin</h1>
        <div className="flex-1 h-px bg-dark-border" />
        <span className="badge badge-amarelo">Admin</span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'Agendados', value: counts.agendado, color: 'text-verde-light' },
          { label: 'Finalizados', value: counts.finalizado, color: 'text-gray-400' },
          { label: 'A definir', value: counts.a_definir, color: 'text-amarelo' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`font-display font-black text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          id="admin-search"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por time, sede ou ID..."
          className="input-field sm:max-w-xs text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'agendado', 'finalizado', 'a_definir'] as StatusFilter[]).map(s => (
            <button
              key={s}
              id={`admin-filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-verde text-white'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              }`}
            >
              {s === 'todos' ? 'Todos' : s === 'agendado' ? '🟢 Agendados' : s === 'finalizado' ? '⚫ Finalizados' : '🟡 A definir'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Carregando jogos...</div>
      )}

      {error && (
        <div className="card border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhum jogo encontrado.</p>
          ) : (
            filtered.map(jogo => (
              <AdminResultForm
                key={jogo.jogo_id}
                jogo={jogo}
                onSuccess={refetch}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
