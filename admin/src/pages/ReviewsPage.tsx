import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reviewsApi } from '../api'

export function ReviewsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'published' | 'all'>('pending')

  const load = () => {
    setLoading(true)
    reviewsApi.list({ size: 100 })
      .then(r => setItems(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setPublished = async (id: string, value: boolean) => {
    await reviewsApi.update(id, { is_published: value })
    setItems(prev => prev.map(r => r.id === id ? { ...r, is_published: value } : r))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return
    await reviewsApi.delete(id)
    setItems(prev => prev.filter(r => r.id !== id))
  }

  const authorName = (r: Record<string, unknown>) => {
    const u = r.user as Record<string, unknown> | null
    if (!u) return '—'
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || '—'
  }

  const visible = items.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? !r.is_published : !!r.is_published
  )

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Отзывы</h1>
        <div className="row" style={{ gap: 8 }}>
          {(['pending', 'published', 'all'] as const).map(f => (
            <button
              key={f}
              className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setFilter(f)}
            >
              {{ pending: 'На модерации', published: 'Опубликованные', all: 'Все' }[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="card card--bordered" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Автор</th>
                <th>Оценка</th>
                <th>Текст</th>
                <th>Проект</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет отзывов</td></tr>
              ) : visible.map(r => {
                const id = r.id as string
                const project = r.project as Record<string, unknown> | null
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>
                      {r.user_id
                        ? <Link to={`/users/${r.user_id}`} style={{ color: 'var(--gold-deep)', textDecoration: 'none' }}>{authorName(r)}</Link>
                        : authorName(r)}
                    </td>
                    <td style={{ color: 'var(--gold-deep)', whiteSpace: 'nowrap' }}>{stars(r.rating as number)}</td>
                    <td className="t-sm" style={{ maxWidth: 320 }}>{r.text as string}</td>
                    <td className="t-sm t-muted">{project?.title as string || '—'}</td>
                    <td className="t-sm">{new Date(r.created_at as string).toLocaleDateString('ru-RU')}</td>
                    <td>
                      {r.is_published
                        ? <span className="badge badge--ok">Опубликован</span>
                        : <span className="badge badge--warn">На модерации</span>}
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {r.is_published ? (
                          <button className="btn btn--ghost btn--sm" onClick={() => setPublished(id, false)}>Снять</button>
                        ) : (
                          <button className="btn btn--primary btn--sm" onClick={() => setPublished(id, true)}>Опубликовать</button>
                        )}
                        <button className="btn btn--sm" style={{ background: '#FFEBEE', color: 'var(--err)', border: 'none' }} onClick={() => handleDelete(id)}>Удал.</button>
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
