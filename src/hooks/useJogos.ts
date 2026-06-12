import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Jogo } from '../types'

interface UseJogosOptions {
  fase?: string
  grupo?: string
  rodada?: number
}

export function useJogos(options: UseJogosOptions = {}) {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJogos = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('jogos')
      .select('*')
      .order('data', { ascending: true })
      .order('horario_brasilia', { ascending: true })

    if (options.fase) query = query.eq('fase', options.fase)
    if (options.grupo) query = query.eq('grupo', options.grupo)
    if (options.rodada !== undefined) query = query.eq('rodada', options.rodada)

    const { data, error: queryError } = await query

    if (queryError) {
      setError('[JOGOS-001] Erro ao carregar jogos')
      console.error('[JOGOS-001]', queryError.message)
    } else {
      setJogos(data ?? [])
    }
    setLoading(false)
  }, [options.fase, options.grupo, options.rodada])

  useEffect(() => {
    fetchJogos()
  }, [fetchJogos])

  return { jogos, loading, error, refetch: fetchJogos }
}
