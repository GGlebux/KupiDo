import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../store/authContext'
import { useToast } from '../../store/toast'
import { bookingsApi } from '../../api/bookings'
import type { Unit } from '../../types'

interface Props {
  unit: Unit | null
  projectTitle?: string
  isOpen: boolean
  onClose: () => void
  onAuthRequired?: () => void
}

export function BookingModal({ unit, projectTitle, isOpen, onClose, onAuthRequired }: Props) {
  const { user } = useAuth()
  const { notify } = useToast()
  const [comment, setComment] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Обновляем форму бронирования под каждый объект (сбрасываем состояние при смене).
  useEffect(() => {
    setComment('')
    setSuccess(false)
    setError('')
    setSubmitting(false)
  }, [unit?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { onAuthRequired?.(); onClose(); return }
    if (!unit) return
    setSubmitting(true)
    setError('')
    try {
      await bookingsApi.create(unit.id, comment || undefined)
      setSuccess(true)
      notify('Бронь оформлена! Менеджер свяжется с вами.', 'success')
    } catch (e: unknown) {
      // 409 — этот объект уже забронирован этим клиентом (повторная бронь запрещена).
      const detail = axios.isAxiosError(e) ? (e.response?.data?.detail as string | undefined) : undefined
      const isDup = axios.isAxiosError(e) && e.response?.status === 409
      const msg = detail || 'Ошибка при создании брони. Попробуйте ещё раз.'
      setError(msg)
      notify(isDup ? msg : 'Не удалось оформить бронь. Попробуйте ещё раз.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !unit) return null

  const fmt = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'
  const label = unit.rooms ? `${unit.rooms}к` : 'Студия'

  return (
    <div className="modal-root is-open" onClick={e => { if (e.target === e.currentTarget) { onClose(); setSuccess(false) } }}>
      <div className="modal">
        <button className="modal__close" onClick={() => { onClose(); setSuccess(false) }}>✕</button>
        <div className="eyebrow">Бронирование</div>
        <h2 className="display mt-12" style={{ fontSize: 32 }}>
          {label} · {unit.area}&nbsp;м²<br />
          {projectTitle && <span style={{ color: 'var(--muted)' }}>{projectTitle}</span>}
        </h2>

        {success ? (
          <div className="mt-24">
            <div className="tag tag--ok" style={{ fontSize: 13, height: 'auto', padding: '10px 16px' }}>
              ✓ Бронь оформлена! Менеджер свяжется с вами.
            </div>
            <button className="btn btn--ghost btn--block mt-16" onClick={() => { onClose(); setSuccess(false) }}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <p className="t-muted mt-12">Бронь действует 5 дней. Залог 30 000 ₽ возвращается при отказе.</p>
            {error && <p style={{ color: 'var(--err)', fontSize: 13, marginTop: 8 }}>{error}</p>}
            <form className="stack mt-24" style={{ gap: 16 }} onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label">Комментарий</label>
                <textarea className="textarea" placeholder="Ипотека, рассрочка, особые пожелания..." value={comment} onChange={e => setComment(e.target.value)} />
              </div>
              <div className="card" style={{ background: 'var(--gold-wash)', padding: 16, borderRadius: 'var(--r-md)' }}>
                <div className="label" style={{ color: 'var(--gold-deep)' }}>Стоимость объекта</div>
                <div className="display mt-4" style={{ fontSize: 28 }}>{fmt(unit.price)}</div>
              </div>
              <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={submitting}>
                {submitting ? 'Оформляем...' : 'Оформить бронь'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
