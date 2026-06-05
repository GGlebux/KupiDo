import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsApi } from '../api'

const BOOKING_STATUS: Record<string, [string, string]> = {
  pending: ['badge--warn', 'Ожидает'],
  confirmed: ['badge--ok', 'Подтверждено'],
  cancelled: ['badge--err', 'Отменено'],
}

const PAYMENT_STATUS: Record<string, [string, string]> = {
  not_paid: ['badge--neutral', 'Не оплачено'],
  deposit_paid: ['badge--warn', 'Задаток'],
  fully_paid: ['badge--ok', 'Оплачено'],
}

type Booking = Record<string, unknown>

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const size = 20

  const load = () => {
    setLoading(true)
    bookingsApi.list({ page, size })
      .then(r => { setBookings(r.data || []); setTotal(r.meta?.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const handleBookingStatus = async (id: string, status: string) => {
    await bookingsApi.update(id, { status })
    load()
  }

  const handlePaymentStatus = async (id: string, payment_status: string) => {
    await bookingsApi.update(id, { payment_status })
    load()
  }

  const handlePaymentAmount = async (id: string) => {
    const amount = parseFloat(payAmount)
    if (isNaN(amount)) return
    await bookingsApi.update(id, { payment_amount: amount })
    setEditing(null)
    setPayAmount('')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить бронирование?')) return
    await bookingsApi.delete(id)
    load()
  }

  const pages = Math.ceil(total / size)

  const userName = (b: Booking) => {
    const u = b.user as Record<string, unknown> | null
    if (!u) return '—'
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
    return name || (u.email as string) || '—'
  }

  const unitLabel = (b: Booking) => {
    const u = b.unit as Record<string, unknown> | null
    if (!u) return '—'
    const parts: string[] = []
    if (u.type === 'studio') parts.push('Студия')
    else if (u.rooms) parts.push(`${u.rooms}-комн.`)
    if (u.area) parts.push(`${u.area} м²`)
    if (u.floor) parts.push(`${u.floor} эт.`)
    return parts.join(', ') || '—'
  }

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Бронирования</h1>
        <span className="t-muted t-sm">Всего: {total}</span>
      </div>

      <div className="card card--bordered" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Объект</th>
                <th>Статус</th>
                <th>Оплата</th>
                <th>Сумма</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет данных</td></tr>
              ) : bookings.map(b => {
                const [bCls, bLabel] = BOOKING_STATUS[b.status as string] || ['badge--neutral', b.status as string]
                const [pCls, pLabel] = PAYMENT_STATUS[b.payment_status as string] || ['badge--neutral', b.payment_status as string]
                const user = b.user as Record<string, unknown> | null
                return (
                  <tr key={b.id as string}>
                    <td className="t-sm t-muted" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(b.created_at as string).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      {user?.id ? (
                        <Link to={`/users/${user.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold-deep)', textDecoration: 'none' }}>{userName(b)}</Link>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{userName(b)}</div>
                      )}
                      {user?.email ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email as string}</div> : null}
                      {user?.phone ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.phone as string}</div> : null}
                    </td>
                    <td className="t-sm">
                      {(() => {
                        const unit = b.unit as Record<string, unknown> | null
                        return unit?.id
                          ? <Link to={`/units/${unit.id}/view`} style={{ color: 'var(--gold-deep)', textDecoration: 'none' }}>{unitLabel(b)}</Link>
                          : unitLabel(b)
                      })()}
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{ fontSize: 12, padding: '4px 8px', minWidth: 130 }}
                        value={b.status as string}
                        onChange={e => handleBookingStatus(b.id as string, e.target.value)}
                      >
                        <option value="pending">Ожидает</option>
                        <option value="confirmed">Подтверждено</option>
                        <option value="cancelled">Отменено</option>
                      </select>
                      <span className={`badge ${bCls}`} style={{ marginLeft: 6, fontSize: 11 }}>{bLabel}</span>
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{ fontSize: 12, padding: '4px 8px', minWidth: 130 }}
                        value={b.payment_status as string || 'not_paid'}
                        onChange={e => handlePaymentStatus(b.id as string, e.target.value)}
                      >
                        <option value="not_paid">Не оплачено</option>
                        <option value="deposit_paid">Задаток</option>
                        <option value="fully_paid">Оплачено</option>
                      </select>
                      <span className={`badge ${pCls}`} style={{ marginLeft: 6, fontSize: 11 }}>{pLabel}</span>
                    </td>
                    <td>
                      {editing === (b.id as string) ? (
                        <div className="row" style={{ gap: 4 }}>
                          <input
                            className="input"
                            type="number"
                            placeholder="₽"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            style={{ width: 90, fontSize: 12, padding: '4px 8px' }}
                          />
                          <button className="btn btn--sm" style={{ fontSize: 11 }} onClick={() => handlePaymentAmount(b.id as string)}>✓</button>
                          <button className="btn btn--sm btn--ghost" style={{ fontSize: 11 }} onClick={() => { setEditing(null); setPayAmount('') }}>✕</button>
                        </div>
                      ) : (
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 12 }}
                          onClick={() => { setEditing(b.id as string); setPayAmount(b.payment_amount ? String(b.payment_amount) : '') }}
                        >
                          {b.payment_amount ? `${Number(b.payment_amount).toLocaleString('ru-RU')} ₽` : '— ₽'}
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn--sm"
                        style={{ background: '#FFEBEE', color: 'var(--err)', border: 'none' }}
                        onClick={() => handleDelete(b.id as string)}
                      >✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="row" style={{ padding: '16px 20px', gap: 8, justifyContent: 'flex-end' }}>
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
