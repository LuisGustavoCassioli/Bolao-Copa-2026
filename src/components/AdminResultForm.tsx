import { useState } from 'react'
import type { Jogo } from '../types'
import { supabase } from '../lib/supabase'

interface AdminResultFormProps {
  jogo: Jogo
  onSuccess: () => void
}

export function AdminResultForm({ jogo, onSuccess }: AdminResultFormProps) {
  const [casa, setCasa] = useState<string>(jogo.placar_casa !== null ? String(jogo.placar_casa) : '')
  const [fora, setFora] = useState<string>(jogo.placar_fora !== null ? String(jogo.placar_fora) : '')
  const [timeCasaEdit, setTimeCasaEdit] = useState(jogo.time_casa ?? '')
  const [timeForaEdit, setTimeForaEdit] = useState(jogo.time_fora ?? '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const isDefinir = jogo.status === 'a_definir'

  async function handleSaveResult() {
    const c = parseInt(casa, 10)
    const f = parseInt(fora, 10)

    if (isNaN(c) || isNaN(f) || c < 0 || f < 0) {
      setFeedback({ type: 'err', msg: 'Placares inválidos' })
      return
    }

    setSaving(true)
    setFeedback(null)

    // 1. Update jogo
    const { error: jogoError } = await supabase
      .from('jogos')
      .update({ status: 'finalizado', placar_casa: c, placar_fora: f, updated_at: new Date().toISOString() })
      .eq('jogo_id', jogo.jogo_id)

    if (jogoError) {
      setFeedback({ type: 'err', msg: '[ADMIN-001] Erro ao salvar resultado' })
      console.error('[ADMIN-001]', jogoError.message)
      setSaving(false)
      return
    }

    // 2. Recalculate pontos for all palpites of this jogo
    const { data: palpites, error: palpitesError } = await supabase
      .from('palpites')
      .select('id, palpite_casa, palpite_fora')
      .eq('jogo_id', jogo.jogo_id)

    if (palpitesError) {
      setFeedback({ type: 'err', msg: '[ADMIN-002] Resultado salvo, mas falha ao recalcular pontos' })
      setSaving(false)
      return
    }

    const updates = (palpites ?? []).map(p => ({
      id: p.id,
      pontos: p.palpite_casa === c && p.palpite_fora === f ? 1 : 0,
      updated_at: new Date().toISOString(),
    }))

    for (const update of updates) {
      await supabase.from('palpites').update({ pontos: update.pontos, updated_at: update.updated_at }).eq('id', update.id)
    }

    setFeedback({ type: 'ok', msg: `✓ Resultado salvo! ${updates.length} palpite(s) recalculados.` })
    setSaving(false)
    onSuccess()
  }

  async function handleSaveTeams() {
    if (!timeCasaEdit.trim() || !timeForaEdit.trim()) {
      setFeedback({ type: 'err', msg: 'Times não podem estar vazios' })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('jogos')
      .update({
        time_casa: timeCasaEdit,
        time_fora: timeForaEdit,
        status: 'agendado',
        updated_at: new Date().toISOString(),
      })
      .eq('jogo_id', jogo.jogo_id)

    if (error) {
      setFeedback({ type: 'err', msg: '[ADMIN-003] Erro ao atualizar times' })
    } else {
      setFeedback({ type: 'ok', msg: '✓ Times atualizados!' })
      onSuccess()
    }
    setSaving(false)
  }

  return (
    <div className="card space-y-4">
      {/* Jogo header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          #{jogo.jogo_id} · {jogo.fase.replace('_', ' ')}
          {jogo.grupo ? ` · Grupo ${jogo.grupo}` : ''}
        </span>
        <span className={`badge ${jogo.status === 'finalizado' ? 'badge-gray' : jogo.status === 'a_definir' ? 'badge-amarelo' : 'badge-verde'}`}>
          {jogo.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <span>{jogo.time_casa ?? 'A definir'}</span>
        <span className="text-gray-500">vs</span>
        <span>{jogo.time_fora ?? 'A definir'}</span>
        <span className="text-gray-500 ml-auto text-xs">{jogo.data} {jogo.horario_brasilia?.slice(0, 5)}</span>
      </div>

      {/* Define teams (for a_definir games) */}
      {isDefinir && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Definir times</p>
          <div className="flex gap-2">
            <input
              id={`admin-time-casa-${jogo.jogo_id}`}
              value={timeCasaEdit}
              onChange={e => setTimeCasaEdit(e.target.value)}
              placeholder="Time Casa"
              className="input-field text-sm"
            />
            <input
              id={`admin-time-fora-${jogo.jogo_id}`}
              value={timeForaEdit}
              onChange={e => setTimeForaEdit(e.target.value)}
              placeholder="Time Fora"
              className="input-field text-sm"
            />
            <button
              id={`btn-admin-teams-${jogo.jogo_id}`}
              onClick={handleSaveTeams}
              disabled={saving}
              className="btn-secondary text-sm px-4 whitespace-nowrap"
            >
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Enter result */}
      {!isDefinir && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Resultado final</p>
          <div className="flex items-center gap-2">
            <input
              id={`admin-placar-casa-${jogo.jogo_id}`}
              type="number"
              min="0"
              value={casa}
              onChange={e => setCasa(e.target.value)}
              className="score-input"
              aria-label="Placar time casa"
            />
            <span className="text-gray-500">×</span>
            <input
              id={`admin-placar-fora-${jogo.jogo_id}`}
              type="number"
              min="0"
              value={fora}
              onChange={e => setFora(e.target.value)}
              className="score-input"
              aria-label="Placar time fora"
            />
            <button
              id={`btn-admin-result-${jogo.jogo_id}`}
              onClick={handleSaveResult}
              disabled={saving || casa === '' || fora === ''}
              className="btn-primary text-sm px-4"
            >
              {saving ? 'Salvando...' : 'Salvar resultado'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <p className={`text-sm font-medium ${feedback.type === 'ok' ? 'text-verde-light' : 'text-red-400'}`}>
          {feedback.msg}
        </p>
      )}
    </div>
  )
}
