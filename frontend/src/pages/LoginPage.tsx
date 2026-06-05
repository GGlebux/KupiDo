import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '../store/authContext'
import { Logo } from '../components/layout/Logo'
import { PhoneInput, RU_PHONE_RE } from '../components/PhoneInput'

type Tab = 'login' | 'register'

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const { user, login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/profile')
  }, [user, navigate])

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const loginForm = useForm<{ email: string; password: string }>()
  const regForm = useForm<{ email: string; password: string; first_name: string; last_name: string; phone: string }>()

  const handleLogin = loginForm.handleSubmit(async (data) => {
    try {
      setError('')
      await login(data.email, data.password)
      navigate('/profile')
    } catch {
      setError('Неверный email или пароль')
    }
  })

  const handleRegister = regForm.handleSubmit(async (data) => {
    try {
      setError('')
      await register(data)
      navigate('/profile')
    } catch {
      setError('Ошибка регистрации. Возможно, email уже занят.')
    }
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ background: 'var(--ink)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span className="display" style={{ color: 'var(--cream)', fontSize: 22 }}>КупиДо</span>
        </Link>

        <div>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>Личный кабинет</div>
          <h1 className="display mt-16" style={{ color: 'var(--cream)', fontSize: 56, lineHeight: 1.05 }}>
            Добро<br />пожаловать<br /><em>домой</em>.
          </h1>
          <p style={{ color: 'rgba(246,242,232,.5)', marginTop: 24, maxWidth: 340, lineHeight: 1.7 }}>
            Управляйте бронированиями, отслеживайте статус сделок и получайте персональные предложения.
          </p>
        </div>

        <div style={{ color: 'rgba(246,242,232,.3)', fontSize: 13 }}>
          © 2024 КупиДо · Все права защищены
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div className="auth-tabs mb-32" style={{ display: 'inline-flex' }}>
            <button className={tab === 'login' ? 'is-active' : ''} onClick={() => { setTab('login'); setError('') }}>Вход</button>
            <button className={tab === 'register' ? 'is-active' : ''} onClick={() => { setTab('register'); setError('') }}>Регистрация</button>
          </div>

          {error && (
            <div style={{ background: '#fee', border: '1px solid var(--err)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--err)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form className="stack" style={{ gap: 16 }} onSubmit={handleLogin} noValidate>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="input" type="email" placeholder="anna@example.ru"
                  {...loginForm.register('email', { required: 'Укажите email' })} />
                {loginForm.formState.errors.email && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{loginForm.formState.errors.email.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Пароль</label>
                <input className="input" type="password" placeholder="••••••••"
                  {...loginForm.register('password', { required: 'Введите пароль' })} />
                {loginForm.formState.errors.password && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{loginForm.formState.errors.password.message}</span>}
              </div>
              <button className="btn btn--primary btn--lg btn--block mt-8" type="submit">Войти в кабинет</button>
            </form>
          ) : (
            <form className="stack" style={{ gap: 16 }} onSubmit={handleRegister} noValidate>
              <div className="g-2" style={{ gap: 16 }}>
                <div className="field">
                  <label className="field__label">Имя</label>
                  <input className="input" placeholder="Анна"
                    {...regForm.register('first_name', { required: 'Укажите имя', minLength: { value: 2, message: 'Минимум 2 символа' } })} />
                  {regForm.formState.errors.first_name && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{regForm.formState.errors.first_name.message}</span>}
                </div>
                <div className="field">
                  <label className="field__label">Фамилия</label>
                  <input className="input" placeholder="Маркова"
                    {...regForm.register('last_name', { required: 'Укажите фамилию', minLength: { value: 2, message: 'Минимум 2 символа' } })} />
                  {regForm.formState.errors.last_name && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{regForm.formState.errors.last_name.message}</span>}
                </div>
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="input" type="email" placeholder="anna@example.ru"
                  {...regForm.register('email', { required: 'Укажите email', pattern: { value: EMAIL_RE, message: 'Некорректный email' } })} />
                {regForm.formState.errors.email && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{regForm.formState.errors.email.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Телефон</label>
                <Controller
                  name="phone"
                  control={regForm.control}
                  rules={{ validate: v => !v || RU_PHONE_RE.test(v) || 'Введите номер +7 (XXX) XXX-XX-XX' }}
                  render={({ field }) => <PhoneInput value={field.value || ''} onChange={field.onChange} />}
                />
                {regForm.formState.errors.phone && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{regForm.formState.errors.phone.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Пароль</label>
                <input className="input" type="password" placeholder="не короче 6 символов" required {...regForm.register('password', { minLength: { value: 6, message: 'Минимум 6 символов' } })} />
                {regForm.formState.errors.password && <span style={{ fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }}>{regForm.formState.errors.password.message}</span>}
              </div>
              <button className="btn btn--primary btn--lg btn--block mt-8" type="submit">Создать аккаунт</button>
            </form>
          )}

          <p className="t-muted mt-24" style={{ fontSize: 13, textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--gold-deep)' }}>← Вернуться на главную</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
