import { Link } from 'react-router-dom'

const STEPS = [
  { icon: '📋', title: 'Выбор объекта', text: 'Помогаем выбрать квартиру, проверяем юридическую чистоту и объясняем все нюансы.' },
  { icon: '🤝', title: 'Согласование условий', text: 'Переговариваем с продавцом, согласовываем цену и условия сделки в ваших интересах.' },
  { icon: '📝', title: 'Подготовка документов', text: 'Собираем пакет документов, проверяем каждую бумагу. Вы ничего не упустите.' },
  { icon: '🏦', title: 'Регистрация', text: 'Сопровождаем в МФЦ или Росреестр, следим за ходом регистрации права собственности.' },
  { icon: '🔑', title: 'Передача ключей', text: 'Присутствуем при приёмке квартиры, фиксируем все замечания, защищаем ваши интересы.' },
]

const TARIFFS = [
  { name: 'Базовый', price: '50 000', items: ['Проверка документов', 'Составление договора', 'Сопровождение в Росреестр'] },
  { name: 'Стандарт', price: '90 000', items: ['Всё из базового', 'Переговоры с продавцом', 'Приёмка квартиры', 'Страхование сделки'] },
  { name: 'Премиум', price: '150 000', items: ['Всё из стандарта', 'Налоговый вычет', 'Персональный юрист', 'Помощь с ипотекой', 'Выезд юриста на объект'] },
]

export function DealSupportPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/services">Услуги</Link>
            <span>Сопровождение сделки</span>
          </nav>
          <div className="eyebrow">Юридическая защита</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Сделка без<br /><em>лишних рисков</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Наши юристы сопровождают каждый этап — от выбора объекта до получения ключей.
            Более 3 000 успешных сделок.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="container">
          <div className="section-title mb-32">Как это работает</div>
          <div className="g-4" style={{ gap: 24, marginBottom: 60 }}>
            {STEPS.map(s => (
              <div key={s.title} className="card card--bordered" style={{ padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="section-title mb-32">Тарифы</div>
          <div className="g-4" style={{ gap: 24, marginBottom: 48 }}>
            {TARIFFS.map(t => (
              <div key={t.name} className="card card--bordered" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{t.name}</h3>
                <div className="display mb-20" style={{ fontSize: 28, color: 'var(--gold-deep)' }}>{t.price} ₽</div>
                <ul className="stack" style={{ gap: 10 }}>
                  {t.items.map(i => (
                    <li key={i} style={{ fontSize: 14, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--ok)' }}>✓</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contacts" className="btn btn--primary btn--block mt-24">Выбрать</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
