import { Link } from 'react-router-dom'
import aboutImg from '../assets/about.jpg'

const NUMBERS = [
  { value: '10+', label: 'лет на рынке' },
  { value: '47', label: 'проектов сдано' },
  { value: '8 500+', label: 'семей' },
  { value: '₽ 180 млрд', label: 'объём строительства' },
]

export function AboutPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>О компании</span>
          </nav>
          <div className="eyebrow">О КупиДо</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Девелопер,<br /><em>которому доверяют</em>
          </h1>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 24, marginBottom: 60 }}>
            {NUMBERS.map(n => (
              <div key={n.label} style={{ textAlign: 'center', padding: 32, background: 'var(--surface-2)', borderRadius: 'var(--r-xl)' }}>
                <div className="display" style={{ fontSize: 48, lineHeight: 1, color: 'var(--gold-deep)' }}>{n.value}</div>
                <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>{n.label}</div>
              </div>
            ))}
          </div>

          <div className="g-4" style={{ gap: 48, alignItems: 'center', marginBottom: 60 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h2 className="display mb-20" style={{ fontSize: 36, lineHeight: 1.15 }}>История КупиДо</h2>
              <div className="stack" style={{ gap: 16, color: 'var(--muted)', lineHeight: 1.8 }}>
                <p>
                  КупиДо была основана в 2014 году командой архитекторов и строителей, объединённых
                  общей идеей: создавать жильё, которое делает жизнь лучше. Мы начинали с одного
                  небольшого проекта в Москве — и сегодня у нас 47 сданных объектов по всей России.
                </p>
                <p>
                  Наша миссия — строить не просто квадратные метры, а пространство для жизни. Каждый
                  проект мы рассматриваем как экосистему: архитектура, инфраструктура, управление
                  и сообщество должны работать вместе.
                </p>
                <p>
                  Мы используем только сертифицированные материалы, работаем с лучшими подрядчиками
                  и никогда не срываем сроки. Это не просто слова — это задокументированная история
                  каждого нашего проекта.
                </p>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <img
                src={aboutImg}
                alt="Команда КупиДо обсуждает проект жилого комплекса"
                style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 'var(--r-xl)', display: 'block' }}
              />
            </div>
          </div>

          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            <Link to="/team" className="btn btn--primary">Познакомиться с командой</Link>
            <Link to="/guarantees" className="btn btn--ghost">Наши гарантии</Link>
          </div>
        </div>
      </section>
    </>
  )
}
