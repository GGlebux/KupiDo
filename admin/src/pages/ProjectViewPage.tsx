import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { projectsApi, unitsApi } from '../api'

const TYPE_LABELS: Record<string, string> = { multi_apartment: 'Многоквартирный дом', private_house_group: 'Малоэтажный ЖК / посёлок' }
const DEAL_LABELS: Record<string, string> = { sale: 'Продажа', rent: 'Аренда' }
const STATUS_LABELS: Record<string, string> = { active: 'Активен', upcoming: 'Скоро', sold_out: 'Продан' }
const UNIT_TYPE: Record<string, string> = { apartment: 'Квартира', studio: 'Студия', penthouse: 'Пентхаус', house: 'Дом' }
const UNIT_STATUS: Record<string, [string, string]> = {
  available: ['badge--ok', 'Доступна'], booked: ['badge--warn', 'Забронирована'], sold: ['badge--err', 'Продана'],
}

export function ProjectViewPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Record<string, unknown> | null>(null)
  const [units, setUnits] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    projectsApi.get(slug)
      .then(async p => {
        setProject(p)
        const u = await unitsApi.listByProject(p.id)
        setUnits(u.data || [])
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Загрузка...</div>
  if (!project) return <div style={{ padding: 40 }}>Проект не найден. <Link to="/projects">← К списку</Link></div>

  const fmt = (n: unknown) => n ? `${(+(n as number) / 1e6).toFixed(1)} млн ₽` : '—'
  const fields: [string, string][] = [
    ['Тип', TYPE_LABELS[project.type as string] || '—'],
    ['Тип сделки', DEAL_LABELS[project.deal_type as string] || 'Продажа'],
    ['Статус', STATUS_LABELS[project.status as string] || (project.status as string)],
    ['Локация', (project.location as string) || '—'],
    ['Адрес', (project.address as string) || '—'],
    ['Цена от', fmt(project.price_from)],
    ['Срок сдачи', project.deadline ? new Date(project.deadline as string).toLocaleDateString('ru-RU') : '—'],
    ['Slug', project.slug as string],
  ]

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="row-between mb-24">
        <h1 className="page-title">{project.title as string}</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--primary" onClick={() => navigate(`/projects/${project.slug}`)}>Редактировать</button>
          <button className="btn btn--ghost" onClick={() => navigate('/projects')}>← К проектам</button>
        </div>
      </div>

      <div className="card card--bordered mb-24" style={{ padding: 28 }}>
        <div className="g-2" style={{ gap: 16 }}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <div className="label t-muted" style={{ fontSize: 11 }}>{label}</div>
              <div style={{ marginTop: 2, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
        {project.description ? (
          <div style={{ marginTop: 20 }}>
            <div className="label t-muted" style={{ fontSize: 11 }}>Описание</div>
            <p style={{ marginTop: 4 }}>{project.description as string}</p>
          </div>
        ) : null}
      </div>

      <div className="card card--bordered">
        <div className="section-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          Квартиры и дома · {units.length}
        </div>
        <table className="data-table">
          <thead><tr><th>Тип / Площадь</th><th>Комнат</th><th>Этаж</th><th>Статус</th><th>Цена</th><th>Действия</th></tr></thead>
          <tbody>
            {units.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Объектов нет</td></tr>
            ) : units.map(u => {
              const [cls, label] = UNIT_STATUS[u.status as string] || ['badge--neutral', u.status as string]
              return (
                <tr key={u.id as string}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{UNIT_TYPE[u.type as string] || u.type as string}</div>
                    <div className="t-muted t-sm">{u.area as number} м²</div>
                  </td>
                  <td>{u.rooms ? String(u.rooms) : 'Студия'}</td>
                  <td>{u.floor ? String(u.floor) : '—'}</td>
                  <td><span className={`badge ${cls}`}>{label}</span></td>
                  <td className="t-sm">{fmt(u.price)}</td>
                  <td>
                    <div className="data-table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/units/${u.id}/view`)}>Просмотр</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/units/${u.id}`)}>Ред.</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
