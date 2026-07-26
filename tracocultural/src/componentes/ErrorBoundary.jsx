import React from 'react'

/**
 * Isola erros de renderização de um pedaço da árvore (ex: o mapa do Leaflet)
 * pra que, se algo quebrar ali, apareça uma mensagem visível em vez da área
 * ficar em branco e o erro só existir escondido no console.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { temErro: false, erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { temErro: true, erro }
  }

  componentDidCatch(erro, info) {
    // Loga sempre, mesmo em produção, com prefixo fácil de filtrar
    console.error('[ErrorBoundary] Falha ao renderizar:', erro, info?.componentStack)
  }

  render() {
    if (this.state.temErro) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              minHeight: '200px',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#fff',
              background: '#3C2321',
              gap: '.5rem',
            }}
          >
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.5rem' }}></i>
            <strong>Não foi possível carregar o mapa.</strong>
            <span style={{ fontSize: '.85rem', opacity: 0.8 }}>
              {this.state.erro?.message || 'Veja o console (F12) para detalhes.'}
            </span>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
