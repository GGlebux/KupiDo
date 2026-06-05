import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { consultationsApi } from '../api/consultations'
import { YandexMap } from '../components/YandexMap'
import { useAuth } from '../store/authContext'
import { PhoneInput, RU_PHONE_RE } from '../components/PhoneInput'

export function ContactsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<{ name: string; phone: string; email?: string; message?: string }>()

  useEffect(() => {
    if (user) {
      reset({
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        phone: user.phone || '',
        email: user.email && user.email.includes('@') && user.email.includes('.') ? user.email : '',
        message: '',
      })
    }
  }, [user, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError('')
      await consultationsApi.create(data)
      setSent(true)
      reset()
    } catch {
      setError('Не удалось отправить сообщение. Попробуйте ещё раз.')
    }
  })

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Контакты</span>
          </nav>
          <div className="eyebrow">Мы рядом</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>Свяжитесь<br /><em>с нами</em></h1>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 60, alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="stack" style={{ gap: 32 }}>
                {[
                  {
                    label: 'Главный офис',
                    items: [
                      { icon: '📍', text: 'Москва, ул. Льва Толстого, 16' },
                      { icon: '🕐', text: 'Пн–Пт: 9:00–20:00, Сб: 10:00–18:00' },
                    ]
                  },
                  {
                    label: 'Телефоны',
                    items: [
                      { icon: '📞', text: '+7 (495) 800-10-20' },
                      { icon: '📞', text: '+7 (800) 100-20-30 (бесплатно)' },
                    ]
                  },
                  {
                    label: 'Email',
                    items: [
                      { icon: '✉️', text: 'info@kupido.ru' },
                      { icon: '✉️', text: 'mortgage@kupido.ru' },
                    ]
                  },
                ].map(({ label, items }) => (
                  <div key={label}>
                    <div className="label t-muted mb-12" style={{ fontSize: 11 }}>{label}</div>
                    <div className="stack" style={{ gap: 8 }}>
                      {items.map(({ icon, text }) => (
                        <div key={text} className="row" style={{ gap: 12, fontSize: 16 }}>
                          <span>{icon}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 40 }}>
                <YandexMap query="Москва, ул. Льва Толстого, 16" height={300} zoom={15} />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="card card--bordered" style={{ padding: 36 }}>
                <h2 className="display mb-8" style={{ fontSize: 28 }}>Напишите нам</h2>
                <p className="t-muted mb-28" style={{ fontSize: 14 }}>Ответим в течение 30 минут в рабочее время</p>

                {!user ? (
                  <div>
                    <p className="t-muted" style={{ marginBottom: 16 }}>
                      Чтобы отправить заявку, войдите в личный кабинет или зарегистрируйтесь.
                    </p>
                    <button className="btn btn--primary btn--block" onClick={() => navigate('/login')}>
                      Войти / Зарегистрироваться
                    </button>
                  </div>
                ) : sent ? (
                  <div>
                    <div className="tag tag--ok" style={{ fontSize: 13, height: 'auto', padding: '12px 20px', marginBottom: 16 }}>
                      ✓ Сообщение отправлено! Свяжемся с вами в ближайшее время.
                    </div>
                    <button className="btn btn--ghost btn--block" onClick={() => setSent(false)}>
                      Отправить ещё одно
                    </button>
                  </div>
                ) : (
                  <form className="stack" style={{ gap: 16 }} onSubmit={onSubmit} noValidate>
                    {error && <p style={{ color: 'var(--err)', fontSize: 13 }}>{error}</p>}
                    <div className="field">
                      <label className="field__label">Имя</label>
                      <input className="input" {...register('name', { required: 'Укажите имя', minLength: { value: 2, message: 'Минимум 2 символа' } })} />
                      {errors.name && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.name.message}</span>}
                    </div>
                    <div className="field">
                      <label className="field__label">Телефон</label>
                      <Controller
                        name="phone"
                        control={control}
                        rules={{ required: 'Укажите телефон', validate: v => RU_PHONE_RE.test(v) || 'Введите номер +7 (XXX) XXX-XX-XX' }}
                        render={({ field }) => <PhoneInput value={field.value || ''} onChange={field.onChange} />}
                      />
                      {errors.phone && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.phone.message}</span>}
                    </div>
                    <div className="field">
                      <label className="field__label">Email (необязательно)</label>
                      <input className="input" type="email" placeholder="anna@example.ru" {...register('email', { validate: v => !v || EMAIL_RE.test(v) || 'Некорректный email' })} />
                      {errors.email && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.email.message}</span>}
                    </div>
                    <div className="field">
                      <label className="field__label">Сообщение (необязательно)</label>
                      <textarea className="textarea" style={{ minHeight: 120 }} {...register('message')} />
                    </div>
                    <button className="btn btn--primary btn--block btn--lg" type="submit">
                      Отправить сообщение
                    </button>
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
