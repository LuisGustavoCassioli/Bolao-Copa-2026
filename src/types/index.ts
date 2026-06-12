export type Fase =
  | 'grupos'
  | 'dezesseis_avos'
  | 'oitavas'
  | 'quartas'
  | 'semifinal'
  | 'terceiro_lugar'
  | 'final'

export type StatusJogo = 'agendado' | 'finalizado' | 'a_definir'

export interface Jogo {
  id: string
  jogo_id: number
  fase: Fase
  grupo: string | null
  rodada: number | null
  data: string
  horario_brasilia: string | null
  time_casa: string | null
  time_fora: string | null
  sede: string | null
  estadio: string | null
  status: StatusJogo
  placar_casa: number | null
  placar_fora: number | null
  created_at: string
}

export interface Palpite {
  id: string
  user_id: string
  jogo_id: number
  palpite_casa: number
  palpite_fora: number
  pontos: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  nome: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export interface RankingEntry {
  user_id: string
  nome: string
  avatar_url: string | null
  total_pontos: number
  total_palpites: number
  acertos: number
}

export interface PalpiteComJogo extends Palpite {
  jogo: Jogo
}
