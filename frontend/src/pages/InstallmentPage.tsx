import { useState } from 'react'
import { Link } from 'react-router-dom'

const PLANS = [
  { name: 'Стандарт', down: '30%', period: '24 мес.', rate: '0%', badge: '' },
  { name: 'Комфорт', down: '20%', period: '36 мес.', rate: '3%', badge: '' },
  { name: 'Максимум', down: '10%', period: '48 мес.', rate: '5%', badge: 'Популярный' },
]

export function InstallmentPage() {
  const [price, setPrice] = useState(8000000)
  const [down, setDown] = useState(30)
  const [months, setMonths] = useState(24)

  const downAmt = (price * down) / 100
  const rest = price - downAmt
  const monthly = Math.round(rest / months)

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/services">Услуги</Link>
            <span>Рассрочка</span>
          </nav>
          <div className="eyebrow">Беспроцентная рассрочка</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Купите сейчас,<br /><em>платите потом</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Рассрочка от КупиДо — без банков, без справок, без переплат. Прямой договор с застройщиком.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 24, marginBottom: 60 }}>
            {PLANS.map(p => (
              <div key={p.name} className="card card--bordered" style={{ padding: 28, position: 'relative' }}>
                {p.badge && <span className="badge badge--ok" style={{ position: 'absolute', top: 16, right: 16, fontSize: 11 }}>{p.badge}</span>}
                <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>{p.name}</h3>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row-between" style={{ fontSize: 14 }}><span style={{ color: 'var(--muted)' }}>Первый взнос</span><strong>{p.down}</strong></div>
                  <div className="row-between" style={{ fontSize: 14 }}><span style={{ color: 'var(--muted)' }}>Срок</span><strong>{p.period}</strong></div>
                  <div className="row-between" style={{ fontSize: 14 }}><span style={{ color: 'var(--muted)' }}>Ставка</span><strong style={{ color: p.rate === '0%' ? 'var(--ok)' : 'inherit' }}>{p.rate}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card--bordered" style={{ padding: 40, maxWidth: 600, marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 24 }}>Калькулятор рассрочки</h2>
            <div className="stack" style={{ gap: 20 }}>
              <div className="field">
                <label className="field__label">Стоимость квартиры: {price.toLocaleString('ru-RU')} ₽</label>
                <input type="range" min={3000000} max={30000000} step={500000} value={price} onChange={e => setPrice(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="field">
                <label className="field__label">Первый взнос: {down}% = {downAmt.toLocaleString('ru-RU')} ₽</label>
                <input type="range" min={10} max={90} step={5} value={down} onChange={e => setDown(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="field">
                <label className="field__label">Срок: {months} месяцев</label>
                <input type="range" min={6} max={48} step={6} value={months} onChange={e => setMonths(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Ежемесячный платёж</div>
                <div className="display" style={{ fontSize: 36, lineHeight: 1, color: 'var(--gold-deep)' }}>
                  {monthly.toLocaleString('ru-RU')} ₽
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Остаток: {rest.toLocaleString('ru-RU')} ₽ / {months} мес.</div>
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 16 }}>
            <Link to="/contacts" className="btn btn--primary">Оформить рассрочку</Link>
            <Link to="/mortgage" className="btn btn--ghost">Сравнить с ипотекой</Link>
          </div>
        </div>
      </section>
    </>
  )
}
