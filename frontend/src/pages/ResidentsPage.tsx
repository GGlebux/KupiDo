import { Link } from 'react-router-dom'

const SERVICES = [
  { icon: '🔧', title: 'Управляющая компания', text: 'Собственная УК обслуживает дома 24/7 — от уборки подъезда до ремонта лифтов.' },
  { icon: '📱', title: 'Мобильное приложение', text: 'Передавайте показания счётчиков, заказывайте пропуски и связывайтесь с консьержем через приложение.' },
  { icon: '🏋️', title: 'Инфраструктура', text: 'Фитнес-залы, коворкинги и зоны отдыха доступны для всех жителей наших комплексов.' },
  { icon: '🛡️', title: 'Охрана и безопасность', text: 'Круглосуточное видеонаблюдение, охраняемая территория и контроль доступа.' },
]

export function ResidentsPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Для жителей</span>
          </nav>
          <div className="eyebrow">Жизнь в КупиДо</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Сервис уровня<br /><em>пятизвёздочного</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Мы заботимся о жителях наших домов не меньше, чем о покупателях. Наша управляющая
            компания обеспечивает комфорт и безопасность каждый день.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 32, marginBottom: 48 }}>
            {SERVICES.map(s => (
              <div key={s.title} className="card card--bordered" style={{ padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="card card--bordered" style={{ padding: 40 }}>
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Личный кабинет жителя</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
              Управляйте своим лицевым счётом, передавайте показания приборов учёта, оставляйте заявки
              на обслуживание и получайте актуальную информацию о вашем доме в одном месте.
            </p>
            <Link to="/login" className="btn btn--primary">Войти в личный кабинет</Link>
          </div>
        </div>
      </section>
    </>
  )
}
