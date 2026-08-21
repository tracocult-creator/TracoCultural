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
