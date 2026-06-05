import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '../../store/authContext'
import { PhoneInput, RU_PHONE_RE } from '../PhoneInput'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errStyle = { fontSize: 12, color: 'var(--err)', marginTop: 4, display: 'block' }

export function AuthModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const { login, register } = useAuth()

  const loginForm = useForm<{ email: string; password: string }>()
  const regForm = useForm<{ email: string; password: string; first_name: string; last_name: string; phone: string }>()

  const handleLogin = loginForm.handleSubmit(async (data) => {
    try {
      setError('')
      await login(data.email, data.password)
      onClose()
    } catch {
      setError('Неверный email или пароль')
    }
  })

  const handleRegister = regForm.handleSubmit(async (data) => {
    try {
      setError('')
      await register(data)
      onClose()
    } catch {
      setError('Ошибка регистрации. Возможно, email уже занят.')
    }
  })

  if (!isOpen) return null

  return (
    <div className="modal-root is-open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="auth-tabs mb-24" style={{ display: 'inline-flex' }}>
          <button className={tab === 'login' ? 'is-active' : ''} onClick={() => { setTab('login'); setError('') }}>Вход</button>
          <button className={tab === 'register' ? 'is-active' : ''} onClick={() => { setTab('register'); setError('') }}>Регистрация</button>
        </div>

        {error && <p style={{ color: 'var(--err)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {tab === 'login' ? (
          <>
            <div className="eyebrow">Личный кабинет</div>
            <h2 className="display mt-12" style={{ fontSize: 40, lineHeight: 1 }}>
              С возвращением,<br /><em>сосед</em>.
            </h2>
            <form className="stack mt-32" style={{ gap: 16 }} onSubmit={handleLogin} noValidate>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="input" type="email" placeholder="anna@example.ru"
                  {...loginForm.register('email', { required: 'Укажите email' })} />
                {loginForm.formState.errors.email && <span style={errStyle}>{loginForm.formState.errors.email.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Пароль</label>
                <input className="input" type="password" placeholder="••••••••"
                  {...loginForm.register('password', { required: 'Введите пароль' })} />
                {loginForm.formState.errors.password && <span style={errStyle}>{loginForm.formState.errors.password.message}</span>}
              </div>
              <button className="btn btn--primary btn--lg btn--block mt-8" type="submit">
                Войти в кабинет
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="eyebrow">Регистрация</div>
            <h2 className="display mt-12" style={{ fontSize: 40, lineHeight: 1 }}>
              Добро<br />пожаловать <em>домой</em>.
            </h2>
            <form className="stack mt-32" style={{ gap: 16 }} onSubmit={handleRegister} noValidate>
              <div className="g-2" style={{ gap: 16 }}>
                <div className="field">
                  <label className="field__label">Имя</label>
                  <input className="input" placeholder="Анна"
                    {...regForm.register('first_name', {
                      required: 'Укажите имя',
                      minLength: { value: 2, message: 'Минимум 2 символа' },
                    })} />
                  {regForm.formState.errors.first_name && <span style={errStyle}>{regForm.formState.errors.first_name.message}</span>}
                </div>
                <div className="field">
                  <label className="field__label">Фамилия</label>
                  <input className="input" placeholder="Маркова"
                    {...regForm.register('last_name', {
                      required: 'Укажите фамилию',
                      minLength: { value: 2, message: 'Минимум 2 символа' },
                    })} />
                  {regForm.formState.errors.last_name && <span style={errStyle}>{regForm.formState.errors.last_name.message}</span>}
                </div>
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="input" type="email" placeholder="anna@example.ru"
                  {...regForm.register('email', {
                    required: 'Укажите email',
                    pattern: { value: EMAIL_RE, message: 'Некорректный email' },
                  })} />
                {regForm.formState.errors.email && <span style={errStyle}>{regForm.formState.errors.email.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Телефон</label>
                <Controller
                  name="phone"
                  control={regForm.control}
                  rules={{ validate: v => !v || RU_PHONE_RE.test(v) || 'Введите номер +7 (XXX) XXX-XX-XX' }}
                  render={({ field }) => <PhoneInput value={field.value || ''} onChange={field.onChange} />}
                />
                {regForm.formState.errors.phone && <span style={errStyle}>{regForm.formState.errors.phone.message}</span>}
              </div>
              <div className="field">
                <label className="field__label">Пароль</label>
                <input className="input" type="password" placeholder="не короче 6 символов"
                  {...regForm.register('password', {
                    required: 'Придумайте пароль',
                    minLength: { value: 6, message: 'Минимум 6 символов' },
                  })} />
                {regForm.formState.errors.password && <span style={errStyle}>{regForm.formState.errors.password.message}</span>}
              </div>
              <button className="btn btn--primary btn--lg btn--block mt-8" type="submit">
                Создать аккаунт
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
