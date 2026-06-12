import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RankingEntry } from '../types'

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchRanking() {
    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('palpites')
      .select('user_id, pontos, profiles!inner(nome, avatar_url)')

    if (queryError) {
      setError('[RANKING-001] Erro ao carregar ranking')
      console.error('[RANKING-001]', queryError.message)
      setLoading(false)
      return
    }

    const totals = new Map<string, RankingEntry>()

    for (const row of data ?? []) {
      const profile = row.profiles as unknown as { nome: string; avatar_url: string | null }
      const entry = totals.get(row.user_id) ?? {
        user_id: row.user_id,
        nome: profile.nome,
        avatar_url: profile.avatar_url,
        total_pontos: 0,
        total_palpites: 0,
        acertos: 0,
      }
      entry.total_pontos += row.pontos ?? 0
      entry.total_palpites += 1
      if (row.pontos > 0) entry.acertos += 1
      totals.set(row.user_id, entry)
    }

    const sorted = Array.from(totals.values()).sort((a, b) => b.total_pontos - a.total_pontos)
    setRanking(sorted)
    setLoading(false)
  }

  useEffect(() => {
    fetchRanking()

    // Real-time subscription for ranking updates
    const channel = supabase
      .channel('ranking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'palpites' }, () => {
        fetchRanking()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { ranking, loading, error, refetch: fetchRanking }
}
