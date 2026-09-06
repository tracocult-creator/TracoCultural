/**
 * Remove acentos e normaliza caixa. Espelha lib/text.ts do app mobile,
 * pra busca/filtro se comportarem igual nas duas pontas (ex: "musica"
 * sem acento tem que achar "Música").
 */
export function normalizeText(value) {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function isEventoEncerrado(evento) {
  const fim = evento.dataFim || evento.dataInicio
  if (!fim) return false
  return new Date(fim).getTime() < Date.now()
}

const DIAS_ATE_REMOCAO = 3
const UM_DIA_MS = 24 * 60 * 60 * 1000

/**
 * Dias restantes até o backend remover automaticamente um evento encerrado
 * (mesma regra de EventoService.removerEventosEncerrados: dataFim, ou
 * dataInicio se não houver dataFim, +3 dias). Retorna null se o evento
 * ainda não encerrou.
 */
export function diasAteRemocao(evento) {
  if (!isEventoEncerrado(evento)) return null
  const fim = new Date(evento.dataFim || evento.dataInicio).getTime()
  const dataRemocao = fim + DIAS_ATE_REMOCAO * UM_DIA_MS
  const diasRestantes = Math.ceil((dataRemocao - Date.now()) / UM_DIA_MS)
  return Math.max(0, diasRestantes)
}