/**
 * Seed script — inserts all 104 games from copa2026_jogos.json into the jogos table.
 * Run: npm run seed
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[SEED] Missing env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const JSON_PATH = path.resolve(__dirname, '../../copa2026_jogos.json')
const raw = fs.readFileSync(JSON_PATH, 'utf-8')
const data = JSON.parse(raw)

interface JogoRaw {
  jogo_id: number
  grupo?: string
  rodada?: number
  data: string
  horario_brasilia?: string
  time_casa?: string
  time_fora?: string
  sede?: string
  estadio?: string
  status?: string
  placar_casa?: number | null
  placar_fora?: number | null
}

function normalizeHorario(h?: string): string | null {
  if (!h) return null
  const parts = h.split(':')
  return `${parts[0].padStart(2, '0')}:${(parts[1] ?? '00').padStart(2, '0')}:00`
}

const faseGruposJogos = (data.fase_grupos ?? []) as JogoRaw[]
const mataMataSections = [
  { fase: 'dezesseis_avos', jogos: data.dezesseis_avos ?? [] },
  { fase: 'oitavas', jogos: data.oitavas ?? [] },
  { fase: 'quartas', jogos: data.quartas ?? [] },
  { fase: 'semifinal', jogos: data.semifinais ?? [] },
  { fase: 'terceiro_lugar', jogos: data.terceiro_lugar ? [data.terceiro_lugar] : [] },
  { fase: 'final', jogos: data.final ? [data.final] : [] },
]

const allJogos = [
  ...faseGruposJogos.map(j => ({
    jogo_id: j.jogo_id,
    fase: 'grupos',
    grupo: j.grupo ?? null,
    rodada: j.rodada ?? null,
    data: j.data,
    horario_brasilia: normalizeHorario(j.horario_brasilia),
    time_casa: j.time_casa ?? null,
    time_fora: j.time_fora ?? null,
    sede: j.sede ?? null,
    estadio: j.estadio ?? null,
    status: j.status ?? 'agendado',
    placar_casa: j.placar_casa ?? null,
    placar_fora: j.placar_fora ?? null,
  })),
  ...mataMataSections.flatMap(({ fase, jogos }) =>
    (jogos as JogoRaw[]).map(j => ({
      jogo_id: j.jogo_id,
      fase,
      grupo: null,
      rodada: null,
      data: j.data,
      horario_brasilia: normalizeHorario(j.horario_brasilia),
      time_casa: j.time_casa ?? null,
      time_fora: j.time_fora ?? null,
      sede: j.sede ?? null,
      estadio: j.estadio ?? null,
      status: j.status ?? 'a_definir',
      placar_casa: j.placar_casa ?? null,
      placar_fora: j.placar_fora ?? null,
    }))
  ),
]

console.log(`[SEED] Inserting ${allJogos.length} games...`)

const BATCH_SIZE = 20
for (let i = 0; i < allJogos.length; i += BATCH_SIZE) {
  const batch = allJogos.slice(i, i + BATCH_SIZE)
  const { error } = await supabase
    .from('jogos')
    .upsert(batch, { onConflict: 'jogo_id' })

  if (error) {
    console.error(`[SEED-001] Batch ${i}-${i + BATCH_SIZE} failed:`, error.message)
  } else {
    console.log(`[SEED] ✓ Batch ${i + 1}–${Math.min(i + BATCH_SIZE, allJogos.length)} inserted`)
  }
}

console.log('[SEED] Done! ✅')
