import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, bookingsApi, consultationsApi, usersApi } from '../api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  projects: number
  bookings: number
  consultations: number
  users: number
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

/** Считает количество броней по 6 последним месяцам из реальных данных. */
function buildChart(bookings: Record<string, unknown>[]) {
  const now = new Date()
  const buckets: { key: string; month: string; bookings: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()], bookings: 0 })
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  bookings.forEach(b => {
    const d = new Date(b.created_at as string)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const i = index.get(key)
    if (i !== undefined) buckets[i].bookings += 1
  })
  return buckets
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ projects: 0, bookings: 0, consultations: 0, users: 0 })
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    Promise.all([
      projectsApi.list({ size: 1 }),
      bookingsApi.list({ size: 500 }),
      consultationsApi.list({ size: 1 }),
      usersApi.list({ size: 1 }),
    ]).then(([p, b, c, u]) => {
      setStats({
        projects: p.meta?.total ?? 0,
        bookings: b.meta?.total ?? 0,
        consultations: c.meta?.total ?? 0,
        users: u.meta?.total ?? 0,
      })
      setBookings(b.data || [])
    }).catch(() => {})
  }, [])

  const chartData = buildChart(bookings)

  const statCards = [
    { label: 'Проектов', value: stats.projects, to: '/projects' },
    { label: 'Бронирований', value: stats.bookings, to: '/bookings' },
    { label: 'Заявок на звонок', value: stats.consultations, to: '/consultations' },
    { label: 'Клиентов', value: stats.users, to: '/users' },
  ]

  return (
    <div>
      <div className="row-between mb-32">
        <h1 className="page-title">Дашборд</h1>
        <div className="t-muted t-sm">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      <div className="g-4 mb-32" style={{ gap: 20 }}>
        {statCards.map(({ label, value, to }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card card--bordered stat-card">
              <div className="stat-card__label">{label}</div>
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__delta t-muted" style={{ fontSize: 12 }}>всего в системе</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="g-2 mb-32" style={{ gap: 20, gridTemplateColumns: '2fr 1fr' }}>
        <div className="card card--bordered" style={{ padding: 24 }}>
          <div className="section-title mb-20">Бронирования по месяцам</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A961" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A961" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8070' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8A8070' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E8E2D4' }} />
              <Area type="monotone" dataKey="bookings" stroke="#C9A961" strokeWidth={2} fill="url(#gold)" name="Бронирований" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card--bordered" style={{ padding: 24 }}>
          <div className="section-title mb-16">Быстрые действия</div>
          <div className="stack" style={{ gap: 8 }}>
            <Link to="/projects/new" className="btn btn--primary" style={{ justifyContent: 'center' }}>+ Добавить проект</Link>
            <Link to="/units/new" className="btn btn--ghost" style={{ justifyContent: 'center' }}>+ Добавить квартиру</Link>
            <Link to="/consultations" className="btn btn--ghost" style={{ justifyContent: 'center' }}>Обработать заявки</Link>
          </div>
        </div>
      </div>

      <RecentBookings bookings={bookings.slice(0, 5)} />
    </div>
  )
}

function RecentBookings({ bookings }: { bookings: Record<string, unknown>[] }) {
  const statusBadge = (s: string) => {
    const map: Record<string, string> = { pending: 'badge--warn', confirmed: 'badge--ok', cancelled: 'badge--err' }
    const labels: Record<string, string> = { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' }
    return <span className={`badge ${map[s] || 'badge--neutral'}`}>{labels[s] || s}</span>
  }

  const clientName = (b: Record<string, unknown>) => {
    const u = b.user as Record<string, unknown> | null
    if (!u) return '—'
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || (u.email as string) || '—'
  }

  return (
    <div className="card card--bordered">
      <div className="row-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="section-title">Последние бронирования</div>
        <Link to="/bookings" className="t-muted t-sm">Все →</Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Клиент</th>
            <th>Статус</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет данных</td></tr>
          ) : bookings.map((b) => (
            <tr key={b.id as string}>
              <td>{new Date(b.created_at as string).toLocaleDateString('ru-RU')}</td>
              <td className="t-sm">{clientName(b)}</td>
              <td>{statusBadge(b.status as string)}</td>
              <td className="t-muted t-sm truncate" style={{ maxWidth: 200 }}>{b.comment as string || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
