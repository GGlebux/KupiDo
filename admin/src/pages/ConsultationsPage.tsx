import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { consultationsApi } from '../api'

export function ConsultationsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending')
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    const params = filter === 'pending' ? { is_processed: false } : filter === 'done' ? { is_processed: true } : {}
    consultationsApi.list({ ...params, size: 100 })
      .then(r => {
        const data = r.data || []
        setItems(data)
        const d: Record<string, string> = {}
        data.forEach((c: Record<string, unknown>) => { d[c.id as string] = (c.result as string) || '' })
        setDrafts(d)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const handleProcess = async (id: string) => {
    await consultationsApi.update(id, { is_processed: true, result: drafts[id] || undefined })
    load()
  }

  const handleSaveResult = async (id: string) => {
    await consultationsApi.update(id, { result: drafts[id] })
    load()
  }

  const RESULT_PRESETS = ['Перезвонить', 'Записан на показ', 'Отправлено КП', 'Не дозвонились', 'Отказ']

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Заявки на звонок</h1>
        <div className="row" style={{ gap: 8 }}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <button
              key={f}
              className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setFilter(f)}
            >
              {{ all: 'Все', pending: 'Новые', done: 'Обработанные' }[f]}
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
                <th>Имя</th>
                <th>Телефон</th>
                <th>Сообщение</th>
                <th>Результат обработки</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет заявок</td></tr>
              ) : items.map(c => {
                const id = c.id as string
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>
                      {c.user_id
                        ? <Link to={`/users/${c.user_id}`} style={{ color: 'var(--gold-deep)', textDecoration: 'none' }}>{c.name as string}</Link>
                        : (c.name as string)}
                    </td>
                    <td><a href={`tel:${c.phone as string}`} style={{ color: 'var(--gold-deep)' }}>{c.phone as string}</a></td>
                    <td className="t-sm t-muted truncate" style={{ maxWidth: 180 }}>{c.message as string || '—'}</td>
                    <td style={{ minWidth: 240 }}>
                      <div className="row" style={{ gap: 6 }}>
                        <input
                          className="input"
                          list={`presets-${id}`}
                          placeholder="например: перезвонить"
                          value={drafts[id] ?? ''}
                          onChange={e => setDrafts(d => ({ ...d, [id]: e.target.value }))}
                          style={{ fontSize: 12, padding: '4px 8px', flex: 1 }}
                        />
                        <datalist id={`presets-${id}`}>
                          {RESULT_PRESETS.map(p => <option key={p} value={p} />)}
                        </datalist>
                        <button
                          className="btn btn--ghost btn--sm" style={{ fontSize: 11 }}
                          onClick={() => handleSaveResult(id)}
                          disabled={(drafts[id] ?? '') === ((c.result as string) || '')}
                        >Сохранить</button>
                      </div>
                    </td>
                    <td className="t-sm">{new Date(c.created_at as string).toLocaleDateString('ru-RU')}</td>
                    <td>
                      {c.is_processed ? (
                        <span className="badge badge--ok">Обработано</span>
                      ) : (
                        <button className="btn btn--sm btn--primary" onClick={() => handleProcess(id)}>
                          Готово
                        </button>
                      )}
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
