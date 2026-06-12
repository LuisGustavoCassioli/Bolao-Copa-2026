import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Palpite } from '../types'

export function usePalpites(userId: string | undefined) {
  const [palpites, setPalpites] = useState<Map<number, Palpite>>(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)

  const fetchPalpites = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('palpites')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('[PALPITES-001]', error.message)
    } else {
      const map = new Map<number, Palpite>()
      for (const p of data ?? []) map.set(p.jogo_id, p)
      setPalpites(map)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchPalpites()
  }, [fetchPalpites])

  async function savePalpite(
    jogoId: number,
    palpiteCasa: number,
    palpiteFora: number
  ): Promise<string | null> {
    if (!userId) return 'Usuário não autenticado'
    setSaving(jogoId)

    const existing = palpites.get(jogoId)
    let error: string | null = null

    if (existing) {
      const { error: updateError } = await supabase
        .from('palpites')
        .update({
          palpite_casa: palpiteCasa,
          palpite_fora: palpiteFora,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      error = updateError?.message ?? null
    } else {
      const { error: insertError } = await supabase
        .from('palpites')
        .insert({
          user_id: userId,
          jogo_id: jogoId,
          palpite_casa: palpiteCasa,
          palpite_fora: palpiteFora,
        })
      error = insertError?.message ?? null
    }

    if (!error) await fetchPalpites()
    setSaving(null)
    return error ? '[PALPITES-002] Erro ao salvar palpite' : null
  }

  return { palpites, loading, saving, savePalpite, refetch: fetchPalpites }
}
