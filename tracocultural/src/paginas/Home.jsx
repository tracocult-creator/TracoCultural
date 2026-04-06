import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import '../estilos/HomePage.css'
import '../estilos/Modal.css'

const estadosBR = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
]

const Home = () => {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // estado para selects / filtros
  const [uf, setUf] = useState('') // '' = todos os estados
  const [category, setCategory] = useState('Todas')
  const [dateFilter, setDateFilter] = useState('')

  const navigate = useNavigate()

  const eventDetails = {
    'Beleza em Foco 2025': {
      image: 'src/assets/EVENTOCABELOS.jpg',
      title: '💇‍♀️ Beleza em Foco 2025',
      date: '12 a 14 de março de 2025',
      location: 'São Paulo – SP',
      description:
        'O Beleza em Foco 2025 é o evento mais aguardado do ano para quem ama o universo dos cabelos, estética e bem-estar. Durante três dias, profissionais renomados e marcas líderes do mercado se reúnem para compartilhar tendências, técnicas e inovações que estão transformando o setor da beleza.\n\nWorkshops práticos, demonstrações ao vivo, palestras inspiradoras e lançamentos de produtos fazem parte da programação. O público poderá experimentar novas linhas de cosméticos, aprender diretamente com especialistas e descobrir soluções sustentáveis para o cuidado capilar.\n\nMais do que um encontro profissional, o evento é um verdadeiro festival de criatividade, autoestima e conexão entre pessoas apaixonadas por beleza.'
    },
    'Car Date': {
      image: 'src/assets/EVENTOCARROS.jpg',
      title: '🚗 Car Date – Encontro Automotivo',
      date: '25 de abril de 2025',
      location: 'Curitiba – PR',
      description:
        'O Car Date reúne os maiores entusiastas do mundo automotivo em um único espaço. É o ponto de encontro de quem respira motores, design e velocidade. O evento traz exposições de supercarros, veículos customizados e lançamentos exclusivos das principais montadoras.\n\nAlém disso, o público poderá acompanhar desfiles temáticos, participar de desafios de arrancada e conhecer pilotos e colecionadores de todo o Brasil. Uma área gastronômica com food trucks, música ao vivo e espaços interativos garantem um ambiente vibrante para toda a família.\n\nPara quem ama carros — sejam clássicos, esportivos ou tunados — o Car Date é uma experiência inesquecível sobre rodas.'
    },
    CinemaLivre: {
      image: 'src/assets/EVENTOCINEMA.jpg',
      title: '🎬 Cinema ao Ar Livre',
      date: '3 e 4 de maio de 2025',
      location: 'Belo Horizonte – MG',
      description:
        'O Cinema ao Ar Livre transforma as noites da capital mineira em um verdadeiro espetáculo sob as estrelas. O evento convida o público a viver uma experiência cinematográfica única, com projeções em tela gigante em um ambiente ao ar livre, repleto de luzes, conforto e boa comida.\n\nDurante dois dias, serão exibidos clássicos do cinema, filmes nacionais e produções independentes, com curadoria especial para todos os gostos. Sessões infantis, romances, aventuras e documentários farão parte da programação.\n\nCom entrada gratuita e estrutura acolhedora, o evento incentiva a cultura, o lazer e o convívio social — unindo pessoas através da magia do cinema.'
    },
    'Cultivo Coletivo 2025': {
      image: 'src/assets/EVENTOCULTIVO.jpg',
      title: '🌱 Cultivo Coletivo 2025',
      date: '10 de junho de 2025',
      location: 'Florianópolis – SC',
      description:
        'O Cultivo Coletivo 2025 é um encontro voltado à sustentabilidade, agricultura urbana e bem-estar. Reunindo agricultores, ambientalistas, empreendedores e cidadãos conscientes, o evento promove um espaço de aprendizado sobre como cultivar uma vida mais verde e equilibrada.\n\nSerão oferecidos cursos práticos sobre hortas domésticas, compostagem, plantio inteligente e alimentação orgânica. Palestras e rodas de conversa abordarão temas como economia circular, consumo consciente e impacto ambiental.\n\nO público poderá também visitar feiras ecológicas, trocar sementes e participar de oficinas de jardinagem. Uma experiência que une natureza, conhecimento e comunidade.'
    },
    'BusiExpo 2025': {
      image: 'src/assets/EVENTOEMPRESA.jpg',
      title: '💼 Business Expo 2025',
      date: '22 a 24 de agosto de 2025',
      location: 'Brasília – DF',
      description:
        'A Business Expo 2025 é o maior evento de negócios e inovação do país. Durante três dias, empreendedores, investidores e líderes de diferentes setores se encontram para trocar experiências, fechar parcerias e explorar novas oportunidades de crescimento.\n\nCom uma programação repleta de palestras, painéis e workshops, o evento abordará temas como tecnologia, empreendedorismo, marketing digital, sustentabilidade e transformação empresarial.\n\nEspaços de networking, estandes interativos e rodadas de negócios criam o ambiente ideal para quem busca expandir seus horizontes e impulsionar resultados. Mais do que uma feira, a Business Expo é um ponto de virada para quem acredita que o futuro dos negócios começa com boas conexões.'
    },
    'Fresio Festival': {
      image: 'src/assets/EVENTOFESTA.jpg',
      title: '🎉 Fresio Festival',
      date: '7 e 8 de setembro de 2025',
      location: 'Recife – PE',
      description:
        'O Fresio Festival é pura energia, cor e alegria! Um evento ao ar livre que celebra o verão, a música e a cultura pernambucana com dois dias intensos de diversão e boas vibrações.\n\nCom uma programação musical diversa, o festival traz artistas locais e nacionais, além de DJs que animam o público até o pôr do sol. Espaços instagramáveis, áreas de descanso e uma vila gastronômica com comidas típicas tornam a experiência ainda mais completa.\n\nEntre um show e outro, os visitantes podem participar de ativações interativas, jogos e oficinas culturais. O Fresio Festival é o destino certo para quem quer viver o melhor da estação cercado de música, amigos e boas memórias.'
    },
    'Festival do Dia das Crianças': {
      image: 'src/assets/EVENTOFESTIVAL.jpg',
      title: '🎠 Festival do Dia das Crianças',
      date: '12 de outubro de 2025',
      location: 'Salvador – BA',
      description:
        'O Festival do Dia das Crianças é um dia dedicado inteiramente à imaginação e à alegria dos pequenos! O evento reúne brinquedos gigantes, apresentações artísticas, shows infantis e diversas atividades educativas.\n\nCom estrutura segura e ambiente familiar, o festival oferece oficinas de arte, contação de histórias, teatro infantil, pintura facial e muito mais. Além disso, os pais podem aproveitar áreas de descanso e alimentação com opções variadas.\n\nÉ um evento que celebra a infância em toda sua magia — um dia para criar memórias inesquecíveis em família.'
    },
    'Book Fair': {
      image: 'src/assets/EVENTOLIVROS.jpg',
      title: '📚 Book Fair – Feira Literária',
      date: '19 a 22 de outubro de 2025',
      location: 'Porto Alegre – RS',
      description:
        'A Book Fair é um dos maiores encontros literários do sul do Brasil. O evento reúne editoras, escritores e leitores apaixonados pela arte das palavras.\n\nDurante quatro dias, o público poderá participar de sessões de autógrafos, lançamentos exclusivos, debates e oficinas de escrita criativa. A feira também conta com uma área infantil, promovendo o incentivo à leitura desde cedo.\n\nAlém dos livros, há apresentações culturais, cafés literários e espaços de convivência. A Book Fair é um convite para descobrir novas histórias e redescobrir o prazer de ler.'
    },
    'Natal Encantado de Gramado': {
      image: 'src/assets/EVENTONATAL.jpg',
      title: '🎄 Natal Encantado de Gramado',
      date: '5 a 28 de dezembro de 2025',
      location: 'Gramado – RS',
      description:
        'O Natal Encantado de Gramado é um dos eventos mais mágicos do ano. A cidade se transforma em um verdadeiro cenário de conto de fadas, iluminada por milhões de luzes e repleta de atrações natalinas.\n\nDesfiles temáticos, espetáculos musicais, corais e feiras de artesanato criam um clima acolhedor e festivo. Crianças e adultos se encantam com a presença do Papai Noel e com as apresentações teatrais que revivem o espírito natalino.\n\nMais do que uma celebração, o evento é uma experiência sensorial e emocional que renova o sentimento de esperança e união.'
    },
    'Os Quintessenciais': {
      image: 'src/assets/EVENTOTEATRO.jpg',
      title: '🎭 Os Quintessenciais – A Comédia do Ano',
      date: '15 de novembro de 2025',
      location: 'Rio de Janeiro – RJ',
      description:
        'A peça Os Quintessenciais promete arrancar gargalhadas e emoções do público carioca. Com um elenco talentoso e roteiro envolvente, a comédia retrata o cotidiano de uma família cheia de personalidades fortes, enfrentando as pequenas confusões do dia a dia.\n\nEntre risadas e reflexões, o espetáculo aborda temas como amor, convivência, identidade e perdão, de forma leve e divertida.\n\nEncenada em um dos teatros mais tradicionais do Rio, a peça oferece uma experiência teatral envolvente, que combina humor, emoção e mensagens profundas sobre a vida moderna.'
    }
  }

  const handleVerMais = (eventTitle) => {
    setSelectedEvent(eventDetails[eventTitle])
    setShowEventModal(true)
  }

  return (
    <div className="home-page">
      <Navbar />

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar eventos..."
          />

          {/* Select controlado para localização */}
          <select
            className="location-select"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            aria-label="Selecionar estado"
          >
            <option value="">Todos os estados</option>
            {estadosBR.map((s) => (
              <option key={s.sigla} value={s.sigla}>
                {s.sigla}
              </option>
            ))}
          </select>

          <button
            className="filter-button"
            onClick={() => setShowFilterModal(true)}
          >
            Filtros
          </button>
        </div>
      </section>

      <section className="title-section">
        <h2 className="main-title">O que vamos fazer?</h2>
      </section>

      <main className="events-grid">
        <div className="event-card">
          <img
            src="src/assets/EVENTOCABELOS.jpg"
            alt="Beleza em Foco 2025"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">💇‍♀️ Beleza em Foco 2025</h3>
            <p className="event-type">Beleza</p>
            <p className="event-date">12 a 14 de março de 2025</p>
            <p className="event-location">📍 São Paulo – SP</p>
            <div className="event-actions">
              <button
                className="btn-ver-mais"
                onClick={() => handleVerMais('Beleza em Foco 2025')}
              >
                Ver mais
              </button>
              <button className="btn-favoritar">
                <i className="bi bi-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOCARROS.jpg"
            alt="Car Date"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🚗 Car Date – Encontro Automotivo</h3>
            <p className="event-type">Automotivo</p>
            <p className="event-date">25 de abril de 2025</p>
            <p className="event-location">📍 Curitiba – PR</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Car Date')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOCINEMA.jpg"
            alt="CinemaLivre"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🎬 CinemaLivre</h3>
            <p className="event-type">Cinema</p>
            <p className="event-date">3 e 4 de maio de 2025</p>
            <p className="event-location">📍 Belo Horizonte – MG</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('CinemaLivre')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOCULTIVO.jpg"
            alt="Cultivo Coletivo 2025"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🌱 Cultivo Coletivo 2025</h3>
            <p className="event-type">Sustentabilidade</p>
            <p className="event-date">10 de junho de 2025</p>
            <p className="event-location">📍 Florianópolis – SC</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Cultivo Coletivo 2025')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOEMPRESA.jpg"
            alt="BusiExpo 2025"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">💼 BusiExpo 2025</h3>
            <p className="event-type">Negócios</p>
            <p className="event-date">22 a 24 de agosto de 2025</p>
            <p className="event-location">📍 Brasília – DF</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('BusiExpo 2025')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOFESTA.jpg"
            alt="Fresio Festival"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🎉 Fresio Festival</h3>
            <p className="event-type">Festival</p>
            <p className="event-date">7 e 8 de setembro de 2025</p>
            <p className="event-location">📍 Recife – PE</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Fresio Festival')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOFESTIVAL.jpg"
            alt="Festival do Dia das Crianças"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🎠 Festival do Dia das Crianças</h3>
            <p className="event-type">Infantil</p>
            <p className="event-date">12 de outubro de 2025</p>
            <p className="event-location">📍 Salvador – BA</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Festival do Dia das Crianças')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOLIVROS.jpg"
            alt="Book Fair"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">📚 Book Fair – Feira Literária</h3>
            <p className="event-type">Literatura</p>
            <p className="event-date">19 a 22 de outubro de 2025</p>
            <p className="event-location">📍 Porto Alegre – RS</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Book Fair')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTONATAL.jpg"
            alt="Natal Encantado de Gramado"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🎄 Natal Encantado de Gramado</h3>
            <p className="event-type">Natal</p>
            <p className="event-date">5 a 28 de dezembro de 2025</p>
            <p className="event-location">📍 Gramado – RS</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Natal Encantado de Gramado')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>

        <div className="event-card">
          <img
            src="src/assets/EVENTOTEATRO.jpg"
            alt="Os Quintessenciais"
            className="event-image"
          />
          <div className="event-content">
            <h3 className="event-title">🎭 Os Quintessenciais – A Comédia do Ano</h3>
            <p className="event-type">Teatro</p>
            <p className="event-date">15 de novembro de 2025</p>
            <p className="event-location">📍 Rio de Janeiro – RJ</p>
            <div className="event-actions">
              <button className="btn-ver-mais" onClick={() => handleVerMais('Os Quintessenciais')}>Ver mais</button>
              <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
            </div>
          </div>
        </div>
      </main>

      {showFilterModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFilterModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filtros</h3>

            <div className="filter-group">
              <label>Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Selecionar categoria"
              >
                <option value="Todas">Todas</option>
                <option value="Música">Música</option>
                <option value="Arte">Arte</option>
                <option value="Teatro">Teatro</option>
                <option value="Dança">Dança</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Data:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowFilterModal(false)}>Aplicar</button>
              <button onClick={() => setShowFilterModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>

            <div className="event-modal-header">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="event-modal-image" />

              <div className="event-modal-info-section">
                <h2 className="event-modal-title">{selectedEvent.title}</h2>
                <p className="event-modal-info">📅 {selectedEvent.date} | 📍 {selectedEvent.location}</p>

                <div className="event-modal-actions">
                  <button className="btn-ingressos">INGRESSOS</button>
                  <button className="btn-icon"><i className="bi bi-share"></i></button>
                  <button className="btn-icon"><i className="bi bi-heart"></i></button>
                </div>
              </div>
            </div>

            <div className="event-modal-body">
              <div className="event-modal-description">
                {selectedEvent.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="comments-section">
                <h3 className="comments-title">Avaliações e Comentários</h3>

                <div className="comment-form">
                  <textarea
                    className="comment-input"
                    placeholder="Deixe seu comentário sobre o evento..."
                    rows="3"
                  ></textarea>
                  <button className="comment-submit">Enviar</button>
                </div>

                <div className="comments-list">
                  <div className="comment-item">
                    <div className="comment-author">Maria Silva</div>
                    <div className="comment-text">Evento incrível! Super recomendo para quem gosta de arte e cultura.</div>
                  </div>
                  <div className="comment-item">
                    <div className="comment-author">João Santos</div>
                    <div className="comment-text">Organização perfeita e programação diversificada. Já estou ansioso para o próximo!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
