import { useState, useEffect } from 'react'
import type { Jogo, Palpite } from '../types'

interface PalpiteFormProps {
  jogo: Jogo
  existing: Palpite | undefined
  onSave: (jogoId: number, casa: number, fora: number) => Promise<string | null>
  saving: boolean
}

function isJogoLocked(jogo: Jogo): boolean {
  if (!jogo.horario_brasilia) return false
  const [h, m] = jogo.horario_brasilia.split(':').map(Number)
  // Convert data + horario_brasilia to UTC-3 (Brasilia)
  const jogoDate = new Date(`${jogo.data}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`)
  return Date.now() >= jogoDate.getTime()
}

export function PalpiteForm({ jogo, existing, onSave, saving }: PalpiteFormProps) {
  const locked = isJogoLocked(jogo) || jogo.status !== 'agendado'

  const [casa, setCasa] = useState<string>(existing !== undefined ? String(existing.palpite_casa) : '')
  const [fora, setFora] = useState<string>(existing !== undefined ? String(existing.palpite_fora) : '')
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (existing) {
      setCasa(String(existing.palpite_casa))
      setFora(String(existing.palpite_fora))
      setDirty(false)
    }
  }, [existing])

  async function handleSave() {
    const c = parseInt(casa, 10)
    const f = parseInt(fora, 10)

    if (isNaN(c) || isNaN(f) || c < 0 || f < 0) {
      setFeedback({ type: 'err', msg: 'Palpite inválido' })
      return
    }

    const error = await onSave(jogo.jogo_id, c, f)
    if (error) {
      setFeedback({ type: 'err', msg: error })
    } else {
      setFeedback({ type: 'ok', msg: 'Palpite salvo!' })
      setDirty(false)
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  if (locked && !existing) {
    return (
      <span className="badge badge-gray">Sem palpite</span>
    )
  }

  if (locked && existing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-lg text-white">
          {existing.palpite_casa} — {existing.palpite_fora}
        </span>
        {jogo.status === 'finalizado' && (
          <span className={existing.pontos > 0 ? 'badge badge-verde' : 'badge badge-gray'}>
            {existing.pontos > 0 ? '✓ +1pt' : '✗ 0pt'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        id={`palpite-casa-${jogo.jogo_id}`}
        type="number"
        min="0"
        max="20"
        value={casa}
        onChange={e => { setCasa(e.target.value); setDirty(true) }}
        className="score-input"
        aria-label={`Palpite ${jogo.time_casa}`}
        disabled={saving}
      />
      <span className="text-gray-500 font-bold">×</span>
      <input
        id={`palpite-fora-${jogo.jogo_id}`}
        type="number"
        min="0"
        max="20"
        value={fora}
        onChange={e => { setFora(e.target.value); setDirty(true) }}
        className="score-input"
        aria-label={`Palpite ${jogo.time_fora}`}
        disabled={saving}
      />
      <button
        id={`btn-save-palpite-${jogo.jogo_id}`}
        onClick={handleSave}
        disabled={saving || !dirty || casa === '' || fora === ''}
        className="btn-amarelo text-sm px-3 py-1.5 ml-1"
        aria-label="Salvar palpite"
      >
        {saving ? '...' : '✓'}
      </button>
      {feedback && (
        <span className={`text-xs font-medium ${feedback.type === 'ok' ? 'text-verde-light' : 'text-red-400'}`}>
          {feedback.msg}
        </span>
      )}
    </div>
  )
}
