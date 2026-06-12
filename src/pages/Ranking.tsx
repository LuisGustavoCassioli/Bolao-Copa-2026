import { useAuth } from '../hooks/useAuth'
import { useRanking } from '../hooks/useRanking'
import { RankingTable } from '../components/RankingTable'

export default function RankingPage() {
  const { user } = useAuth()
  const { ranking, loading, error, refetch } = useRanking()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="section-title">🏆 Ranking</h1>
        <div className="flex-1 h-px bg-dark-border" />
        <button
          id="btn-refresh-ranking"
          onClick={refetch}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Atualizar ranking"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 bg-verde rounded-full animate-pulse-verde" />
        <span className="text-xs text-gray-500">Atualização em tempo real</span>
        <span className="text-xs text-gray-600">· {ranking.length} participante{ranking.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <span className="text-2xl animate-spin mr-3">🏆</span>
          Carregando ranking...
        </div>
      )}

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <RankingTable entries={ranking} currentUserId={user?.id} />
      )}
    </div>
  )
}
