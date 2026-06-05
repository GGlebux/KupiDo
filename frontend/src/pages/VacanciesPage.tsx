import { Link } from 'react-router-dom'

const VACANCIES = [
  { dept: 'Продажи', title: 'Менеджер по продажам', type: 'Полная занятость', location: 'Москва', hot: true },
  { dept: 'Продажи', title: 'Ипотечный брокер', type: 'Полная занятость', location: 'Москва', hot: false },
  { dept: 'Маркетинг', title: 'Контент-менеджер', type: 'Полная занятость / Удалённо', location: 'Россия', hot: false },
  { dept: 'Строительство', title: 'Прораб', type: 'Полная занятость', location: 'Москва', hot: true },
  { dept: 'IT', title: 'Frontend-разработчик (React)', type: 'Полная занятость / Гибрид', location: 'Москва', hot: true },
  { dept: 'Юридический', title: 'Юрист по недвижимости', type: 'Полная занятость', location: 'Москва', hot: false },
]

export function VacanciesPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Вакансии</span>
          </nav>
          <div className="eyebrow">Карьера в КупиДо</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Строим вместе<br /><em>будущее</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Мы — команда профессионалов, которые создают качественное жильё. Присоединяйтесь к нам
            и стройте свою карьеру вместе с нами.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="stack" style={{ gap: 16, maxWidth: 800 }}>
            {VACANCIES.map(v => (
              <div key={v.title} className="card card--bordered" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{v.dept}</span>
                    {v.hot && <span className="badge badge--warn" style={{ fontSize: 10 }}>Hot</span>}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{v.title}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
                    <span>📍 {v.location}</span>
                    <span>⏱ {v.type}</span>
                  </div>
                </div>
                <Link to="/contacts" className="btn btn--ghost" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Откликнуться
                </Link>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: 32, background: 'var(--surface-2)', borderRadius: 'var(--r-xl)', maxWidth: 800 }}>
            <h3 style={{ marginBottom: 12, fontSize: 22 }}>Не нашли подходящую вакансию?</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
              Отправьте резюме на <strong>hr@kupido.ru</strong> — мы всегда рады талантливым людям
              и рассмотрим вашу кандидатуру для будущих позиций.
            </p>
            <a href="mailto:hr@kupido.ru" className="btn btn--primary">Отправить резюме</a>
          </div>
        </div>
      </section>
    </>
  )
}
