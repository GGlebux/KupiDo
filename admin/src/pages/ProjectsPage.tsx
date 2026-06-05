import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../api'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    projectsApi.list({ size: 50 })
      .then(r => setProjects(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить проект «${title}»?`)) return
    await projectsApi.delete(id)
    load()
  }

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      active: ['badge--ok', 'Активен'],
      sold_out: ['badge--neutral', 'Продан'],
      upcoming: ['badge--warn', 'Скоро'],
    }
    const [cls, label] = map[s] || ['badge--neutral', s]
    return <span className={`badge ${cls}`}>{label}</span>
  }

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Проекты</h1>
        <Link to="/projects/new" className="btn btn--primary">+ Добавить проект</Link>
      </div>

      <div className="card card--bordered">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Цена от</th>
                <th>Срок сдачи</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Проектов нет</td></tr>
              ) : projects.map(p => (
                <tr key={p.id as string}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title as string}</div>
                    <div className="t-muted t-sm">{p.slug as string}</div>
                  </td>
                  <td className="t-sm">{p.type === 'multi_apartment' ? 'МКД' : 'МЖК'}</td>
                  <td>{statusBadge(p.status as string)}</td>
                  <td className="t-sm">
                    {p.price_from ? `${(+(p.price_from as number) / 1e6).toFixed(1)} млн ₽` : '—'}
                  </td>
                  <td className="t-sm">{p.deadline ? new Date(p.deadline as string).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    <div className="data-table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/projects/${p.slug}/view`)}>Просмотр</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/projects/${p.slug}`)}>Ред.</button>
                      <button className="btn btn--sm" style={{ background: '#FFEBEE', color: 'var(--err)', border: 'none' }} onClick={() => handleDelete(p.id as string, p.title as string)}>Удал.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
