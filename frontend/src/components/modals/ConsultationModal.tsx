import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { consultationsApi } from '../../api/consultations'
import { useAuth } from '../../store/authContext'
import { PhoneInput, RU_PHONE_RE } from '../PhoneInput'

interface Props {
  isOpen: boolean
  onClose: () => void
  projectId?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ConsultationModal({ isOpen, onClose, projectId }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<{
    name: string; phone: string; email?: string; message?: string
  }>()

  // Предзаполняем имя и телефон из профиля авторизованного клиента.
  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        phone: user.phone || '',
        email: user.email && user.email.includes('@') && user.email.includes('.') ? user.email : '',
        message: '',
      })
    }
  }, [isOpen, user, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError('')
      await consultationsApi.create({ ...data, project_id: projectId })
      setSuccess(true)
    } catch {
      setError('Не удалось отправить заявку. Попробуйте ещё раз.')
    }
  })

  if (!isOpen) return null

  const close = () => { onClose(); setSuccess(false); setError('') }

  return (
    <div className="modal-root is-open" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="modal">
        <button className="modal__close" onClick={close}>✕</button>
        <div className="eyebrow">Обратный звонок</div>
        <h2 className="display mt-12" style={{ fontSize: 32 }}>Перезвоним<br />в&nbsp;течение часа.</h2>

        {!user ? (
          <div className="mt-24">
            <p className="t-muted" style={{ marginBottom: 16 }}>
              Оставить заявку могут только авторизованные клиенты. Войдите или зарегистрируйтесь — это займёт минуту.
            </p>
            <button className="btn btn--primary btn--block" onClick={() => { close(); navigate('/login') }}>
              Войти / Зарегистрироваться
            </button>
          </div>
        ) : success ? (
          <div className="mt-24">
            <span className="tag tag--ok" style={{ fontSize: 13, height: 'auto', padding: '10px 16px' }}>
              ✓ Заявка принята! Ожидайте звонка.
            </span>
            <button className="btn btn--ghost btn--block mt-16" onClick={close}>Закрыть</button>
          </div>
        ) : (
          <form className="stack mt-24" style={{ gap: 16 }} onSubmit={onSubmit} noValidate>
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
              <textarea className="textarea" style={{ minHeight: 80 }} {...register('message')} />
            </div>
            <button className="btn btn--primary btn--block" type="submit">Жду звонка</button>
          </form>
        )}
      </div>
    </div>
  )
}
