// Lista completa dos estados brasileiros. Centralizado aqui pra não
// duplicar o mapeamento UF <-> nome em cada tela, e pra servir de base
// na conversão do nome de estado devolvido pela geolocalização (reverse
// geocoding) pro UF salvo no perfil do usuário.
export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]

export const NOMES_ESTADOS = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia',
  RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe',
  TO: 'Tocantins',
}

// nome do estado (como o Nominatim devolve, em pt-BR) -> UF
const UF_POR_NOME = Object.fromEntries(
  Object.entries(NOMES_ESTADOS).map(([uf, nome]) => [nome, uf])
)

/** Converte o nome do estado devolvido pelo reverse geocoding em UF. */
export function ufPorNomeEstado(nomeEstado) {
  if (!nomeEstado) return null
  return UF_POR_NOME[nomeEstado] || null
}
