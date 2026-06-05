import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { unitsApi } from '../api'

const UNIT_TYPE: Record<string, string> = { apartment: 'Квартира', studio: 'Студия', penthouse: 'Пентхаус', house: 'Дом' }
const UNIT_STATUS: Record<string, [string, string]> = {
  available: ['badge--ok', 'Доступна'], booked: ['badge--warn', 'Забронирована'], sold: ['badge--err', 'Продана'],
}

export function UnitViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    unitsApi.get(id)
      .then(setUnit)
      .catch(() => setUnit(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Загрузка...</div>
  if (!unit) return <div style={{ padding: 40 }}>Объект не найден. <Link to="/units">← К списку</Link></div>

  const fmt = (n: unknown) => n ? `${(+(n as number) / 1e6).toFixed(1)} млн ₽` : '—'
  const project = unit.project as Record<string, unknown> | null
  const photos = (unit.photos as Record<string, unknown>[]) || []
  const [cls, statusLabel] = UNIT_STATUS[unit.status as string] || ['badge--neutral', unit.status as string]

  const fields: [string, React.ReactNode][] = [
    ['Тип', UNIT_TYPE[unit.type as string] || (unit.type as string)],
    ['Статус', <span className={`badge ${cls}`}>{statusLabel}</span>],
    ['Площадь', `${unit.area as number} м²`],
    ['Этаж', unit.floor ? String(unit.floor) : '—'],
    ['Комнат', unit.rooms ? String(unit.rooms) : 'Студия'],
    ['Цена', fmt(unit.price)],
    ['Проект', project?.slug
      ? <Link to={`/projects/${project.slug}/view`} style={{ color: 'var(--gold-deep)' }}>{project.title as string}</Link>
      : '—'],
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="row-between mb-24">
        <h1 className="page-title">{UNIT_TYPE[unit.type as string] || 'Объект'} · {unit.area as number} м²</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--primary" onClick={() => navigate(`/units/${unit.id}`)}>Редактировать</button>
          <button className="btn btn--ghost" onClick={() => navigate('/units')}>← К квартирам</button>
        </div>
      </div>

      <div className="card card--bordered mb-24" style={{ padding: 28 }}>
        <div className="g-2" style={{ gap: 16 }}>
          {fields.map(([label, value], i) => (
            <div key={i}>
              <div className="label t-muted" style={{ fontSize: 11 }}>{label}</div>
              <div style={{ marginTop: 2, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
        {unit.description ? (
          <div style={{ marginTop: 20 }}>
            <div className="label t-muted" style={{ fontSize: 11 }}>Описание</div>
            <p style={{ marginTop: 4 }}>{unit.description as string}</p>
          </div>
        ) : null}
      </div>

      {photos.length > 0 && (
        <div className="card card--bordered" style={{ padding: 28 }}>
          <div className="section-title mb-16">Фотографии · {photos.length}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {photos.map(p => (
              <img key={p.id as string} src={p.url as string} alt="" style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
