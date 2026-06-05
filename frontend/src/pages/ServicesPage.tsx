import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConsultationModal } from '../components/modals/ConsultationModal'

const services = [
  {
    icon: '🏗',
    title: 'Продажа квартир',
    desc: 'Первичный рынок от застройщика без посредников. Актуальные цены и полная юридическая поддержка.',
    items: ['Квартиры в новостройках', 'Пентхаусы и апартаменты', 'Коммерческая недвижимость', 'Паркинг и кладовые'],
  },
  {
    icon: '📋',
    title: 'Оформление сделок',
    desc: 'Юридическое сопровождение от проверки документов до регистрации права собственности.',
    items: ['Проверка застройщика и объекта', 'ДДУ и уступка прав', 'Регистрация в Росреестре', 'Нотариальные услуги'],
  },
  {
    icon: '💳',
    title: 'Ипотека и рассрочка',
    desc: 'Помогаем получить одобрение в 15+ банках-партнёрах с минимальным участием клиента.',
    items: ['Ипотека от 4.9%', 'Беспроцентная рассрочка', 'Материнский капитал', 'Trade-in старой квартиры'],
  },
  {
    icon: '🎨',
    title: 'Отделка под ключ',
    desc: 'Дизайн-проект и ремонт от партнёрских студий с гарантией и прозрачной сметой.',
    items: ['Дизайн интерьера', 'Черновая и чистовая отделка', 'Меблировка', 'Авторский надзор'],
  },
  {
    icon: '🔑',
    title: 'Управление недвижимостью',
    desc: 'Сдаём вашу квартиру в аренду, управляем объектом и решаем бытовые вопросы.',
    items: ['Поиск арендаторов', 'Сбор платежей', 'Техническое обслуживание', 'Страхование объекта'],
  },
  {
    icon: '📊',
    title: 'Инвестиционный анализ',
    desc: 'Подбираем объекты с наилучшим потенциалом роста и доходностью от аренды.',
    items: ['ROI и сроки окупаемости', 'Рыночная аналитика', 'Диверсификация портфеля', 'Налоговая оптимизация'],
  },
]

export function ServicesPage() {
  const [consultOpen, setConsultOpen] = useState(false)

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Услуги</span>
          </nav>
          <div className="eyebrow">Что мы делаем</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>Полный цикл<br /><em>сделки</em></h1>
          <p className="t-muted mt-20" style={{ maxWidth: 560, fontSize: 17 }}>
            От первого просмотра до получения ключей — сопровождаем на каждом этапе.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-3" style={{ gap: 32 }}>
            {services.map(({ icon, title, desc, items }) => (
              <div key={title} className="card card--bordered" style={{ padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{icon}</div>
                <h3 className="display" style={{ fontSize: 24 }}>{title}</h3>
                <p className="t-muted mt-12" style={{ fontSize: 15, lineHeight: 1.7 }}>{desc}</p>
                <ul className="stack mt-20" style={{ gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
                  {items.map(item => (
                    <li key={item} className="row" style={{ gap: 10, fontSize: 14, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="btn btn--ghost mt-24" style={{ fontSize: 13 }} onClick={() => setConsultOpen(true)}>
                  Узнать подробнее →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--ink)', paddingTop: 100, paddingBottom: 100 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>Работаем с 2012 года</div>
          <div className="g-4 mt-48" style={{ gap: 32 }}>
            {[
              { value: '2 400+', label: 'Сделок закрыто' },
              { value: '98%', label: 'Клиентов довольны' },
              { value: '15', label: 'Банков-партнёров' },
              { value: '12 лет', label: 'На рынке' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="display" style={{ color: 'var(--cream)', fontSize: 52 }}>{value}</div>
                <div className="t-muted mt-8" style={{ color: 'rgba(246,242,232,.5)', fontSize: 15 }}>{label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn--gold btn--lg mt-64" onClick={() => setConsultOpen(true)}>
            Получить бесплатную консультацию
          </button>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div className="section-head mb-48">
            <div className="eyebrow">Этапы работы</div>
            <h2 className="display mt-12" style={{ fontSize: 40 }}>Как мы работаем</h2>
          </div>
          <div className="g-4" style={{ gap: 32 }}>
            {[
              { n: '01', title: 'Консультация', desc: 'Бесплатно разбираем ваш запрос и подбираем варианты под бюджет и потребности.' },
              { n: '02', title: 'Показ объектов', desc: 'Организуем выезды на объекты в удобное время. Онлайн-туры — по желанию.' },
              { n: '03', title: 'Бронирование', desc: 'Фиксируем цену и бронируем квартиру на 5 дней с залогом 30 000 ₽.' },
              { n: '04', title: 'Оформление сделки', desc: 'Юристы готовят документы, сопровождают подписание ДДУ и регистрацию.' },
            ].map(({ n, title, desc }) => (
              <div key={n}>
                <div className="display" style={{ fontSize: 48, color: 'var(--gold)', opacity: .4 }}>{n}</div>
                <h3 className="display mt-8" style={{ fontSize: 22 }}>{title}</h3>
                <p className="t-muted mt-12" style={{ fontSize: 15, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  )
}
