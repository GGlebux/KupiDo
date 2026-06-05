import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usersApi, bookingsApi, consultationsApi, reviewsApi } from '../api'

const BOOKING_STATUS: Record<string, [string, string]> = {
  pending: ['badge--warn', 'Ожидает'],
  confirmed: ['badge--ok', 'Подтверждено'],
  cancelled: ['badge--err', 'Отменено'],
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [consultations, setConsultations] = useState<Record<string, unknown>[]>([])
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      usersApi.get(id),
      bookingsApi.list({ user_id: id, size: 100 }),
      consultationsApi.list({ user_id: id, size: 100 }),
      reviewsApi.list({ user_id: id, size: 100 }),
    ])
      .then(([u, b, c, r]) => {
        setUser(u)
        setBookings(b.data || [])
        setConsultations(c.data || [])
        setReviews(r.data || [])
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Загрузка...</div>
  if (!user) return <div style={{ padding: 40 }}>Клиент не найден. <Link to="/users">← К списку</Link></div>

  const unitLabel = (u: Record<string, unknown> | null) => {
    if (!u) return '—'
    const parts: string[] = []
    if (u.type === 'studio') parts.push('Студия')
    else if (u.rooms) parts.push(`${u.rooms}-комн.`)
    if (u.area) parts.push(`${u.area} м²`)
    return parts.join(', ') || '—'
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="row-between mb-24">
        <h1 className="page-title">Клиент</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/users')}>← К клиентам</button>
      </div>

      <div className="card card--bordered mb-24" style={{ padding: 28 }}>
        <div className="display" style={{ fontSize: 24 }}>{user.first_name as string} {user.last_name as string}</div>
        <div className="row mt-12" style={{ gap: 32, flexWrap: 'wrap' }}>
          <div><div className="label t-muted" style={{ fontSize: 11 }}>Email</div><div>{user.email as string}</div></div>
          <div><div className="label t-muted" style={{ fontSize: 11 }}>Телефон</div><div>{(user.phone as string) || '—'}</div></div>
          <div><div className="label t-muted" style={{ fontSize: 11 }}>Роль</div><div><span className={`badge ${user.role === 'admin' ? 'badge--warn' : 'badge--neutral'}`}>{user.role as string}</span></div></div>
          <div><div className="label t-muted" style={{ fontSize: 11 }}>Регистрация</div><div>{new Date(user.created_at as string).toLocaleDateString('ru-RU')}</div></div>
        </div>
      </div>

      <div className="card card--bordered mb-24">
        <div className="section-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          Бронирования · {bookings.length}
        </div>
        <table className="data-table">
          <thead><tr><th>Дата</th><th>Объект</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Броней нет</td></tr>
            ) : bookings.map(b => {
              const [cls, label] = BOOKING_STATUS[b.status as string] || ['badge--neutral', b.status as string]
              const unit = b.unit as Record<string, unknown> | null
              return (
                <tr key={b.id as string}>
                  <td className="t-sm t-muted">{new Date(b.created_at as string).toLocaleDateString('ru-RU')}</td>
                  <td className="t-sm">{unitLabel(unit)}</td>
                  <td><span className={`badge ${cls}`}>{label}</span></td>
                  <td>
                    {unit?.id ? <Link className="t-sm" to={`/units/${unit.id as string}/view`} style={{ color: 'var(--gold-deep)' }}>Открыть объект →</Link> : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card card--bordered mb-24">
        <div className="section-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          Заявки · {consultations.length}
        </div>
        <table className="data-table">
          <thead><tr><th>Дата</th><th>Сообщение</th><th>Результат</th><th>Статус</th></tr></thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Заявок нет</td></tr>
            ) : consultations.map(c => (
              <tr key={c.id as string}>
                <td className="t-sm t-muted">{new Date(c.created_at as string).toLocaleDateString('ru-RU')}</td>
                <td className="t-sm">{(c.message as string) || '—'}</td>
                <td className="t-sm">{(c.result as string) || '—'}</td>
                <td>{c.is_processed ? <span className="badge badge--ok">Обработано</span> : <span className="badge badge--warn">Новая</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card card--bordered">
        <div className="row-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-title">Отзывы · {reviews.length}</div>
          <Link to="/reviews" className="t-sm" style={{ color: 'var(--gold-deep)' }}>Модерация →</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>Дата</th><th>Оценка</th><th>Текст</th><th>Статус</th></tr></thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Отзывов нет</td></tr>
            ) : reviews.map(r => (
              <tr key={r.id as string}>
                <td className="t-sm t-muted">{new Date(r.created_at as string).toLocaleDateString('ru-RU')}</td>
                <td style={{ color: 'var(--gold-deep)', whiteSpace: 'nowrap' }}>{'★'.repeat(r.rating as number)}{'☆'.repeat(5 - (r.rating as number))}</td>
                <td className="t-sm" style={{ maxWidth: 320 }}>{r.text as string}</td>
                <td>{r.is_published ? <span className="badge badge--ok">Опубликован</span> : <span className="badge badge--warn">На модерации</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
