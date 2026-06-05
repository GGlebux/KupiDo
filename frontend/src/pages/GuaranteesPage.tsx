import { Link } from 'react-router-dom'

const GUARANTEES = [
  {
    icon: '📋',
    title: 'Договор долевого участия',
    text: 'Мы работаем только по ДДУ, зарегистрированному в Росреестре. Никаких «серых» схем.'
  },
  {
    icon: '🏦',
    title: 'Эскроу-счета',
    text: 'Ваши деньги хранятся в аккредитованном банке и перечисляются застройщику только после сдачи дома.'
  },
  {
    icon: '🛡️',
    title: 'Гарантийный срок 5 лет',
    text: 'Мы несём ответственность за качество строительства в течение 5 лет после передачи ключей.'
  },
  {
    icon: '📅',
    title: 'Соблюдение сроков',
    text: '47 проектов — ни одного нарушения срока сдачи. За просрочку — неустойка по закону 214-ФЗ.'
  },
  {
    icon: '✅',
    title: 'Разрешение на строительство',
    text: 'Все объекты имеют актуальные разрешения на строительство. Документы доступны для проверки.'
  },
  {
    icon: '🔍',
    title: 'Независимый технадзор',
    text: 'Привлекаем независимых экспертов для контроля качества строительных работ на каждом этапе.'
  },
]

export function GuaranteesPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/about">О компании</Link>
            <span>Гарантии</span>
          </nav>
          <div className="eyebrow">Надёжность КупиДо</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Ваша защита<br /><em>прежде всего</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Мы строим на принципах полной прозрачности. Каждое обязательство закреплено юридически.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 32, marginBottom: 48 }}>
            {GUARANTEES.map(g => (
              <div key={g.title} className="card card--bordered" style={{ padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{g.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{g.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{g.text}</p>
              </div>
            ))}
          </div>

          <Link to="/documents" className="btn btn--ghost">Посмотреть документы →</Link>
        </div>
      </section>
    </>
  )
}
