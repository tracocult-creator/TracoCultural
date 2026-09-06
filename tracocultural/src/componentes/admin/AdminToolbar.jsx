import React from 'react'

/**
 * Barra de ferramentas padrão das seções de gerenciamento do admin:
 * busca por texto + filtros em dropdown + contador de resultados.
 *
 * `filters`: [{ key, label, value, onChange, options: [{ value, label }] }]
 */
const AdminToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  filters = [],
  total,
  filteredTotal,
  onClearFilters,
}) => {
  const temFiltroAtivo =
    (searchValue && searchValue.trim().length > 0) ||
    filters.some((f) => f.value && f.value !== 'todos')

  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-row">
        <div className="admin-search">
          <i className="bi bi-search admin-search-icon"></i>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
          {searchValue && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Limpar pesquisa"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <div className="admin-filters">
            {filters.map((f) => (
              <div className="admin-filter" key={f.key}>
                {f.label && <label>{f.label}</label>}
                <select value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {temFiltroAtivo && onClearFilters && (
          <button type="button" className="admin-toolbar-reset" onClick={onClearFilters}>
            <i className="bi bi-arrow-counterclockwise"></i>
            Limpar
          </button>
        )}
      </div>

      {typeof total === 'number' && (
        <div className="admin-toolbar-count">
          {temFiltroAtivo ? (
            <>Mostrando <strong>{filteredTotal}</strong> de <strong>{total}</strong></>
          ) : (
            <><strong>{total}</strong> {total === 1 ? 'registro' : 'registros'} no total</>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminToolbar