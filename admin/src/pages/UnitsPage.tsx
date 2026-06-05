import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { unitsApi } from '../api'

export function UnitsPage() {
  const [units, setUnits] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    unitsApi.list({ size: 100 })
      .then(r => setUnits(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить квартиру?')) return
    await unitsApi.delete(id)
    load()
  }

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      available: ['badge--ok', 'Доступна'],
      booked: ['badge--warn', 'Забронирована'],
      sold: ['badge--err', 'Продана'],
    }
    const [cls, label] = map[s] || ['badge--neutral', s]
    return <span className={`badge ${cls}`}>{label}</span>
  }

  const typeLabels: Record<string, string> = {
    apartment: 'Квартира',
    studio: 'Студия',
    penthouse: 'Пентхаус',
    house: 'Дом',
  }

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Квартиры</h1>
        <Link to="/units/new" className="btn btn--primary">+ Добавить</Link>
      </div>

      <div className="card card--bordered">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Тип / Площадь</th>
                <th>Проект</th>
                <th>Комнат</th>
                <th>Этаж</th>
                <th>Статус</th>
                <th>Цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет квартир</td></tr>
              ) : units.map(u => {
                const project = u.project as Record<string, unknown> | null
                return (
                <tr key={u.id as string}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{typeLabels[u.type as string] || u.type as string}</div>
                    <div className="t-muted t-sm">{u.area as number} м²</div>
                  </td>
                  <td className="t-sm">
                    {project?.slug
                      ? <Link to={`/projects/${project.slug}/view`} style={{ color: 'var(--gold-deep)', textDecoration: 'none' }}>{project.title as string}</Link>
                      : '—'}
                  </td>
                  <td>{u.rooms ? String(u.rooms) : 'Студия'}</td>
                  <td>{u.floor ? String(u.floor) : '—'}</td>
                  <td>{statusBadge(u.status as string)}</td>
                  <td>
                    {u.price
                      ? `${(+(u.price as number) / 1e6).toFixed(1)} млн ₽`
                      : '—'}
                  </td>
                  <td>
                    <div className="data-table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/units/${u.id}/view`)}>Просмотр</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/units/${u.id}`)}>Ред.</button>
                      <button className="btn btn--sm" style={{ background: '#FFEBEE', color: 'var(--err)', border: 'none' }} onClick={() => handleDelete(u.id as string)}>Удал.</button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
