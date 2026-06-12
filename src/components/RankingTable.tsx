import type { RankingEntry } from '../types'

interface RankingTableProps {
  entries: RankingEntry[]
  currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_CLASSES = [
  'bg-gradient-gold border-amarelo/40',
  'bg-gradient-silver border-gray-400/30',
  'bg-gradient-bronze border-amber-700/40',
]

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function RankingTable({ entries, currentUserId }: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">🏆</p>
        <p>Nenhum palpite registrado ainda.</p>
        <p className="text-sm mt-1">Seja o primeiro a pontuar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => {
        const position = idx + 1
        const isTop3 = position <= 3
        const isCurrentUser = entry.user_id === currentUserId

        return (
          <div
            key={entry.user_id}
            id={`ranking-row-${position}`}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200
              ${isTop3 ? `${MEDAL_CLASSES[idx]} text-dark` : 'bg-dark-card border-dark-border text-white'}
              ${isCurrentUser ? 'ring-2 ring-verde ring-offset-1 ring-offset-dark' : ''}
              animate-slide-up
            `}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Position */}
            <div className="flex-shrink-0 w-8 text-center">
              {isTop3 ? (
                <span className="text-xl" role="img" aria-label={`${position}º lugar`}>
                  {MEDALS[idx]}
                </span>
              ) : (
                <span className={`font-display font-bold text-lg ${isTop3 ? 'text-dark' : 'text-gray-400'}`}>
                  {position}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                ${isTop3 ? 'bg-black/20 text-dark' : 'bg-verde/20 text-verde-light'}
              `}
              aria-hidden="true"
            >
              {getInitials(entry.nome)}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${isTop3 ? 'text-dark' : 'text-white'}`}>
                {entry.nome}
                {isCurrentUser && (
                  <span className={`ml-2 text-xs font-normal ${isTop3 ? 'text-dark/60' : 'text-gray-500'}`}>
                    (você)
                  </span>
                )}
              </p>
              <p className={`text-xs ${isTop3 ? 'text-dark/60' : 'text-gray-500'}`}>
                {entry.acertos} acerto{entry.acertos !== 1 ? 's' : ''} · {entry.total_palpites} palpite{entry.total_palpites !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Points */}
            <div className="flex-shrink-0 text-right">
              <p className={`font-display font-black text-2xl leading-none ${isTop3 ? 'text-dark' : 'text-amarelo'}`}>
                {entry.total_pontos}
              </p>
              <p className={`text-xs ${isTop3 ? 'text-dark/60' : 'text-gray-500'}`}>
                ponto{entry.total_pontos !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
