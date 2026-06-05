import { Link } from 'react-router-dom'

const PERKS = [
  { icon: '📈', title: 'Доходность 18–24% годовых', text: 'Исторически подтверждённая доходность по нашим проектам за последние 10 лет.' },
  { icon: '🏗️', title: 'Вход на этапе котлована', text: 'Ранний вход в проект позволяет зафиксировать минимальную цену и максимизировать прибыль.' },
  { icon: '🔒', title: 'Эскроу-счета', text: 'Деньги хранятся на эскроу-счетах в аккредитованных банках до завершения строительства.' },
  { icon: '📊', title: 'Персональный финансовый план', text: 'Подберём стратегию под ваш бюджет: от одной квартиры до портфеля из 10+ объектов.' },
]

export function InvestorsPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Инвесторам</span>
          </nav>
          <div className="eyebrow">Инвестиции в недвижимость</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Вложите деньги<br /><em>с умом</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            КупиДо предлагает инвесторам прозрачные условия, профессиональное сопровождение и
            проверенные объекты с понятной доходностью.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 32 }}>
            {PERKS.map(p => (
              <div key={p.title} className="card card--bordered" style={{ padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{p.text}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--ink)', padding: 48, marginTop: 48, borderRadius: 'var(--r-xl)', textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Следующий шаг</div>
            <h2 className="display mt-12" style={{ color: 'var(--cream)', fontSize: 40, lineHeight: 1.1 }}>
              Обсудим вашу стратегию
            </h2>
            <p style={{ color: 'rgba(246,242,232,.6)', marginTop: 16, marginBottom: 32, fontSize: 16 }}>
              Запишитесь на бесплатную консультацию с нашим инвестиционным аналитиком
            </p>
            <Link to="/contacts" className="btn btn--gold btn--lg">Записаться на консультацию</Link>
          </div>
        </div>
      </section>
    </>
  )
}
