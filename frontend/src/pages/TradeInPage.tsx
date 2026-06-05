import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { consultationsApi } from '../api/consultations'

const STEPS = [
  { num: '01', title: 'Оценка', text: 'Наши оценщики выезжают на объект в удобное для вас время и определяют рыночную стоимость.' },
  { num: '02', title: 'Бронь', text: 'Мы бронируем выбранную вами квартиру на срок, пока ведётся продажа вашей недвижимости.' },
  { num: '03', title: 'Продажа', text: 'Наши риелторы берут на себя продажу вашей квартиры — реклама, показы, переговоры.' },
  { num: '04', title: 'Зачёт', text: 'Вырученные средства идут в счёт новой квартиры. Разницу можно доплатить или взять ипотеку.' },
]

export function TradeInPage() {
  const [sent, setSent] = useState(false)
  const PHONE_RE = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; phone: string; address: string }>()

  const onSubmit = handleSubmit(async (data) => {
    await consultationsApi.create({ ...data, message: `Trade-in. Адрес: ${data.address}` })
    setSent(true)
    reset()
  })

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/services">Услуги</Link>
            <span>Trade-in</span>
          </nav>
          <div className="eyebrow">Обмен недвижимости</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Обменяйте старое<br /><em>на новое</em>
          </h1>
          <p style={{ maxWidth: '60ch', marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
            Зачтём стоимость вашей квартиры в счёт покупки нашей. Вы ничего не продаёте сами.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 24, marginBottom: 60 }}>
            {STEPS.map(s => (
              <div key={s.num} className="card card--bordered" style={{ padding: 28 }}>
                <div className="display" style={{ fontSize: 40, color: 'var(--gold)', lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="g-4" style={{ gap: 60, alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: 32, marginBottom: 24, lineHeight: 1.2 }}>
                Почему это выгодно?
              </h2>
              <div className="stack" style={{ gap: 16, color: 'var(--muted)', lineHeight: 1.8 }}>
                <p>Вы избегаете двойного переезда — из старой квартиры сразу в новую.</p>
                <p>Не нужно тратить время на самостоятельную продажу: мы делаем это за вас.</p>
                <p>Цена новой квартиры фиксируется на момент брони, даже если рынок растёт.</p>
                <p>Комиссия за продажу вашей квартиры — 0%. Мы зарабатываем на продаже наших объектов.</p>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="card card--bordered" style={{ padding: 36 }}>
                <h3 style={{ fontSize: 22, marginBottom: 20 }}>Оставить заявку</h3>
                {sent ? (
                  <div className="tag tag--ok" style={{ fontSize: 13, height: 'auto', padding: '12px 20px' }}>
                    ✓ Заявка принята! Свяжемся в течение часа.
                  </div>
                ) : (
                  <form className="stack" style={{ gap: 16 }} onSubmit={onSubmit}>
                    <div className="field">
                      <label className="field__label">Имя</label>
                      <input className="input" required {...register('name')} />
                    </div>
                    <div className="field">
                      <label className="field__label">Телефон</label>
                      <input className="input" type="tel" required placeholder="+7 (___) ___-__-__" {...register('phone', { validate: v => PHONE_RE.test(v) || 'Формат: +7 (XXX) XXX-XX-XX' })} />
                      {errors.phone && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.phone.message}</span>}
                    </div>
                    <div className="field">
                      <label className="field__label">Адрес вашей квартиры</label>
                      <input className="input" placeholder="ул. Ленина, 5, кв. 12" {...register('address')} />
                    </div>
                    <button className="btn btn--primary btn--block" type="submit">Отправить заявку</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
