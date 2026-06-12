import type { Jogo, Palpite } from '../types'
import { PalpiteForm } from './PalpiteForm'

interface JogoCardProps {
  jogo: Jogo
  palpite: Palpite | undefined
  onSave: (jogoId: number, casa: number, fora: number) => Promise<string | null>
  saving: boolean
}

const STATUS_LABELS: Record<string, string> = {
  agendado: 'Agendado',
  finalizado: 'Finalizado',
  a_definir: 'A definir',
}

const STATUS_CLASSES: Record<string, string> = {
  agendado: 'badge-verde',
  finalizado: 'badge-gray',
  a_definir: 'badge-amarelo',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

function FlagEmoji({ country }: { country: string }) {
  const flags: Record<string, string> = {
    'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'França': '🇫🇷', 'Espanha': '🇪🇸',
    'Alemanha': '🇩🇪', 'Portugal': '🇵🇹', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'México': '🇲🇽',
    'Estados Unidos': '🇺🇸', 'Canadá': '🇨🇦', 'Holanda': '🇳🇱', 'Bélgica': '🇧🇪',
    'Japão': '🇯🇵', 'Coreia do Sul': '🇰🇷', 'Marrocos': '🇲🇦', 'Senegal': '🇸🇳',
    'Uruguai': '🇺🇾', 'Colômbia': '🇨🇴', 'Noruega': '🇳🇴', 'Croácia': '🇭🇷',
    'Suíça': '🇨🇭', 'Austrália': '🇦🇺', 'Turquia': '🇹🇷', 'Equador': '🇪🇨',
    'Suécia': '🇸🇪', 'Polônia': '🇵🇱', 'Irã': '🇮🇷', 'Nova Zelândia': '🇳🇿',
    'Arábia Saudita': '🇸🇦', 'África do Sul': '🇿🇦', 'Gana': '🇬🇭', 'Tunísia': '🇹🇳',
    'Egito': '🇪🇬', 'Haiti': '🇭🇹', 'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'República Tcheca': '🇨🇿',
    'Bósnia e Herzegovina': '🇧🇦', 'Catar': '🇶🇦', 'Paraguai': '🇵🇾',
    'Curaçao': '🇨🇼', 'Costa do Marfim': '🇨🇮', 'Cabo Verde': '🇨🇻',
    'Argélia': '🇩🇿', 'Iraque': '🇮🇶', 'Jordânia': '🇯🇴', 'Áustria': '🇦🇹',
    'RD Congo': '🇨🇩', 'Panamá': '🇵🇦', 'Uzbequistão': '🇺🇿',
    'A definir': '❓',
  }
  return <span>{flags[country] ?? '🏳️'}</span>
}

export function JogoCard({ jogo, palpite, onSave, saving }: JogoCardProps) {
  const isDefinir = jogo.status === 'a_definir'
  const isFinalizado = jogo.status === 'finalizado'

  return (
    <article
      className={`card-hover animate-slide-up ${isFinalizado ? 'border-dark-border' : ''}`}
      aria-label={`Jogo ${jogo.time_casa} x ${jogo.time_fora}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDate(jogo.data)}</span>
          {jogo.horario_brasilia && (
            <>
              <span>·</span>
              <span>{jogo.horario_brasilia.slice(0, 5)}h (BRT)</span>
            </>
          )}
          {jogo.sede && (
            <>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline truncate max-w-[140px]">{jogo.sede}</span>
            </>
          )}
        </div>
        <span className={`badge ${STATUS_CLASSES[jogo.status]}`}>
          {STATUS_LABELS[jogo.status]}
        </span>
      </div>

      {/* Teams row */}
      {isDefinir ? (
        <div className="flex items-center justify-center py-2">
          <span className="text-gray-500 text-sm font-medium">A definir</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <FlagEmoji country={jogo.time_casa ?? ''} />
            <span className="font-semibold text-white truncate text-sm">
              {jogo.time_casa}
            </span>
          </div>

          {/* Score / separator */}
          <div className="flex-shrink-0 text-center px-2">
            {isFinalizado && jogo.placar_casa !== null && jogo.placar_fora !== null ? (
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-2xl text-amarelo">
                  {jogo.placar_casa}
                </span>
                <span className="text-gray-500 text-sm">—</span>
                <span className="font-display font-black text-2xl text-amarelo">
                  {jogo.placar_fora}
                </span>
              </div>
            ) : (
              <span className="text-gray-600 font-bold text-sm">VS</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
            <span className="font-semibold text-white truncate text-sm text-right">
              {jogo.time_fora}
            </span>
            <FlagEmoji country={jogo.time_fora ?? ''} />
          </div>
        </div>
      )}

      {/* Palpite row */}
      {!isDefinir && (
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between">
          <span className="text-xs text-gray-500">Seu palpite:</span>
          <PalpiteForm
            jogo={jogo}
            existing={palpite}
            onSave={onSave}
            saving={saving}
          />
        </div>
      )}

      {/* Group/round badge */}
      {jogo.grupo && (
        <div className="mt-2 flex gap-2">
          <span className="text-xs text-gray-600">
            Grupo {jogo.grupo} · Rodada {jogo.rodada}
          </span>
        </div>
      )}
    </article>
  )
}
