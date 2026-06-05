import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConsultationModal } from '../components/modals/ConsultationModal'

const banks = [
  { name: 'Сбер', rate: 4.9, color: '#21A038' },
  { name: 'ВТБ', rate: 5.2, color: '#009FDF' },
  { name: 'Альфа', rate: 5.5, color: '#EF3124' },
  { name: 'Т-Банк', rate: 5.8, color: '#FFDD2D' },
]

export function MortgagePage() {
  const [price, setPrice] = useState(8_000_000)
  const [downPct, setDownPct] = useState(20)
  const [years, setYears] = useState(20)
  const [consultOpen, setConsultOpen] = useState(false)

  const down = Math.round(price * downPct / 100)
  const loan = price - down

  const calcPayment = (rate: number) => {
    const r = rate / 100 / 12
    const n = years * 12
    if (r === 0) return loan / n
    return loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  }

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n))
  const fmtM = (n: number) => (n / 1e6).toFixed(1).replace('.', ',') + ' млн ₽'

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Ипотечный калькулятор</span>
          </nav>
          <div className="eyebrow">Ипотека</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>Рассчитайте<br /><em>платёж</em></h1>
          <p className="t-muted mt-20" style={{ maxWidth: 540, fontSize: 17 }}>
            Подберём лучшие условия у партнёрских банков. Одна заявка — несколько предложений.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 48, alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card card--bordered" style={{ padding: 36 }}>
                <h3 className="display mb-32" style={{ fontSize: 24 }}>Параметры</h3>

                <div className="field mb-32">
                  <div className="row-between mb-12">
                    <label className="field__label">Стоимость объекта</label>
                    <span className="display" style={{ fontSize: 20 }}>{fmtM(price)}</span>
                  </div>
                  <input
                    type="range" className="slider" min={1_000_000} max={50_000_000} step={500_000}
                    value={price} onChange={e => setPrice(+e.target.value)}
                  />
                  <div className="row-between mt-8">
                    <span className="t-muted" style={{ fontSize: 12 }}>1 млн ₽</span>
                    <span className="t-muted" style={{ fontSize: 12 }}>50 млн ₽</span>
                  </div>
                </div>

                <div className="field mb-32">
                  <div className="row-between mb-12">
                    <label className="field__label">Первоначальный взнос</label>
                    <span className="display" style={{ fontSize: 20 }}>{downPct}% · {fmtM(down)}</span>
                  </div>
                  <input
                    type="range" className="slider" min={10} max={90} step={5}
                    value={downPct} onChange={e => setDownPct(+e.target.value)}
                  />
                  <div className="row-between mt-8">
                    <span className="t-muted" style={{ fontSize: 12 }}>10%</span>
                    <span className="t-muted" style={{ fontSize: 12 }}>90%</span>
                  </div>
                </div>

                <div className="field">
                  <div className="row-between mb-12">
                    <label className="field__label">Срок кредита</label>
                    <span className="display" style={{ fontSize: 20 }}>{years} лет</span>
                  </div>
                  <input
                    type="range" className="slider" min={5} max={30} step={5}
                    value={years} onChange={e => setYears(+e.target.value)}
                  />
                  <div className="row-between mt-8">
                    <span className="t-muted" style={{ fontSize: 12 }}>5 лет</span>
                    <span className="t-muted" style={{ fontSize: 12 }}>30 лет</span>
                  </div>
                </div>

                <div className="card mt-32" style={{ background: 'var(--surface-2)', padding: 20, borderRadius: 'var(--r-lg)' }}>
                  <div className="row" style={{ gap: 32 }}>
                    <div>
                      <div className="label t-muted" style={{ fontSize: 11 }}>Сумма кредита</div>
                      <div className="display mt-4" style={{ fontSize: 22 }}>{fmtM(loan)}</div>
                    </div>
                    <div>
                      <div className="label t-muted" style={{ fontSize: 11 }}>Взнос</div>
                      <div className="display mt-4" style={{ fontSize: 22 }}>{fmtM(down)}</div>
                    </div>
                    <div>
                      <div className="label t-muted" style={{ fontSize: 11 }}>Срок</div>
                      <div className="display mt-4" style={{ fontSize: 22 }}>{years} лет</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="stack" style={{ gap: 16 }}>
                {banks.map(bank => {
                  const payment = calcPayment(bank.rate)
                  const total = payment * years * 12
                  const overpay = total - loan
                  return (
                    <div key={bank.name} className="card card--bordered" style={{ padding: 24 }}>
                      <div className="row-between mb-16">
                        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: bank.color }} />
                          <span className="display" style={{ fontSize: 20 }}>{bank.name}</span>
                        </div>
                        <span className="tag tag--ok" style={{ fontSize: 13 }}>{bank.rate}%</span>
                      </div>
                      <div className="display" style={{ fontSize: 36, lineHeight: 1 }}>{fmt(payment)} <span style={{ fontSize: 18, color: 'var(--muted)' }}>₽/мес</span></div>
                      <div className="row mt-16" style={{ gap: 24 }}>
                        <div>
                          <div className="label t-muted" style={{ fontSize: 11 }}>Переплата</div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{fmtM(overpay)}</div>
                        </div>
                        <div>
                          <div className="label t-muted" style={{ fontSize: 11 }}>Всего выплат</div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{fmtM(total)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Заявка на консультацию — аккуратный блок под калькулятором с параметрами */}
          <div className="card" style={{ background: 'var(--ink)', padding: 40, marginTop: 32, borderRadius: 'var(--r-xl)' }}>
            <div className="g-2" style={{ gap: 32, alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--gold)' }}>Оставить заявку</div>
                <h3 className="display mt-12" style={{ color: 'var(--cream)', fontSize: 32, lineHeight: 1.1 }}>
                  Одобрим ипотеку<br />за 1 день
                </h3>
                <p style={{ color: 'rgba(246,242,232,.6)', fontSize: 15, marginTop: 12, lineHeight: 1.6, maxWidth: '42ch' }}>
                  Наш ипотечный брокер подберёт оптимальные условия в нескольких банках и поможет с документами — бесплатно.
                </p>
              </div>
              <div className="stack" style={{ gap: 12 }}>
                <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div className="label" style={{ color: 'rgba(246,242,232,.5)', fontSize: 11 }}>Ставка от</div>
                    <div className="display t-gold" style={{ fontSize: 28 }}>4,9%</div>
                  </div>
                  <div>
                    <div className="label" style={{ color: 'rgba(246,242,232,.5)', fontSize: 11 }}>Решение</div>
                    <div className="display" style={{ fontSize: 28, color: 'var(--cream)' }}>1 день</div>
                  </div>
                  <div>
                    <div className="label" style={{ color: 'rgba(246,242,232,.5)', fontSize: 11 }}>Банков-партнёров</div>
                    <div className="display" style={{ fontSize: 28, color: 'var(--cream)' }}>12</div>
                  </div>
                </div>
                <button className="btn btn--gold btn--block btn--lg mt-8" onClick={() => setConsultOpen(true)}>
                  Получить консультацию
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--surface-2)', paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div className="section-head mb-48">
            <div className="eyebrow">Ипотечные программы</div>
            <h2 className="display mt-12" style={{ fontSize: 40 }}>Специальные условия</h2>
          </div>
          <div className="g-3" style={{ gap: 24 }}>
            {[
              { title: 'Семейная ипотека', rate: 'от 4.9%', desc: 'Для семей с детьми до 18 лет. Максимальная сумма 12 млн ₽', tag: 'Государственная' },
              { title: 'IT-ипотека', rate: 'от 4.9%', desc: 'Для сотрудников IT-компаний. Возраст до 50 лет', tag: 'Льготная' },
              { title: 'Льготная ипотека', rate: 'от 7%', desc: 'На новостройки по государственной программе', tag: 'Государственная' },
            ].map(({ title, rate, desc, tag }) => (
              <div key={title} className="card card--bordered" style={{ padding: 28 }}>
                <span className="tag tag--ok" style={{ fontSize: 11, marginBottom: 16 }}>{tag}</span>
                <h3 className="display mt-8" style={{ fontSize: 22 }}>{title}</h3>
                <div className="display mt-8" style={{ fontSize: 28, color: 'var(--gold-deep)' }}>{rate}</div>
                <p className="t-muted mt-12" style={{ fontSize: 14 }}>{desc}</p>
                <button className="btn btn--ghost mt-20" style={{ fontSize: 13 }} onClick={() => setConsultOpen(true)}>
                  Уточнить условия →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  )
}
