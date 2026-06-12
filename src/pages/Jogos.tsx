import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useJogos } from '../hooks/useJogos'
import { usePalpites } from '../hooks/usePalpites'
import { JogoCard } from '../components/JogoCard'
import type { Jogo } from '../types'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const RODADAS = [1, 2, 3]

type FaseFilter = 'grupos' | 'mata-mata'

export default function JogosPage() {
  const { user } = useAuth()
  const [faseFilter, setFaseFilter] = useState<FaseFilter>('grupos')
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null)
  const [rodadaFilter, setRodadaFilter] = useState<number | null>(null)

  const { jogos, loading, error, refetch } = useJogos({
    fase: faseFilter === 'grupos' ? 'grupos' : undefined,
  })
  const { palpites, saving, savePalpite } = usePalpites(user?.id)

  const filteredJogos = useMemo(() => {
    let list = jogos

    if (faseFilter === 'mata-mata') {
      list = list.filter(j => j.fase !== 'grupos')
    }

    if (grupoFilter) {
      list = list.filter(j => j.grupo === grupoFilter)
    }

    if (rodadaFilter) {
      list = list.filter(j => j.rodada === rodadaFilter)
    }

    return list
  }, [jogos, faseFilter, grupoFilter, rodadaFilter])

  // Group by round for display
  const grouped = useMemo(() => {
    if (faseFilter === 'mata-mata') {
      return new Map<string, Jogo[]>([['mata-mata', filteredJogos]])
    }

    const map = new Map<string, Jogo[]>()
    for (const jogo of filteredJogos) {
      const key = `Rodada ${jogo.rodada}`
      const list = map.get(key) ?? []
      list.push(jogo)
      map.set(key, list)
    }
    return map
  }, [filteredJogos, faseFilter])

  async function handleSave(jogoId: number, casa: number, fora: number) {
    const error = await savePalpite(jogoId, casa, fora)
    if (!error) await refetch()
    return error
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="section-title">⚽ Jogos</h1>
        <div className="flex-1 h-px bg-dark-border" />
        <span className="text-sm text-gray-500">{filteredJogos.length} jogo{filteredJogos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 mb-4">
        {(['grupos', 'mata-mata'] as FaseFilter[]).map(fase => (
          <button
            key={fase}
            id={`tab-fase-${fase}`}
            onClick={() => { setFaseFilter(fase); setGrupoFilter(null); setRodadaFilter(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              faseFilter === fase
                ? 'bg-verde text-white'
                : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
            }`}
          >
            {fase === 'grupos' ? '🗓 Fase de Grupos' : '⚔️ Mata-Mata'}
          </button>
        ))}
      </div>

      {/* Filters */}
      {faseFilter === 'grupos' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Grupo filter */}
          <div className="flex gap-1 flex-wrap">
            <button
              id="filter-grupo-all"
              onClick={() => setGrupoFilter(null)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${!grupoFilter ? 'bg-verde text-white' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'}`}
            >
              Todos grupos
            </button>
            {GRUPOS.map(g => (
              <button
                key={g}
                id={`filter-grupo-${g}`}
                onClick={() => setGrupoFilter(g === grupoFilter ? null : g)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${grupoFilter === g ? 'bg-verde text-white' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'}`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="w-px bg-dark-border self-stretch mx-1" />

          {/* Rodada filter */}
          <div className="flex gap-1">
            <button
              id="filter-rodada-all"
              onClick={() => setRodadaFilter(null)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${!rodadaFilter ? 'bg-amarelo text-dark' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'}`}
            >
              Todas
            </button>
            {RODADAS.map(r => (
              <button
                key={r}
                id={`filter-rodada-${r}`}
                onClick={() => setRodadaFilter(r === rodadaFilter ? null : r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${rodadaFilter === r ? 'bg-amarelo text-dark' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'}`}
              >
                {r}ª rodada
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <span className="text-2xl animate-spin mr-3">⚽</span>
          Carregando jogos...
        </div>
      )}

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredJogos.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📅</p>
          <p>Nenhum jogo encontrado com esses filtros.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([groupLabel, groupJogos]) => (
            <section key={groupLabel}>
              {groupLabel !== 'mata-mata' && (
                <h2 className="font-display font-bold text-lg text-gray-400 uppercase tracking-wide mb-3">
                  {groupLabel}
                </h2>
              )}
              <div className="grid grid-cols-1 gap-3">
                {groupJogos.map(jogo => (
                  <JogoCard
                    key={jogo.jogo_id}
                    jogo={jogo}
                    palpite={palpites.get(jogo.jogo_id)}
                    onSave={handleSave}
                    saving={saving === jogo.jogo_id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
