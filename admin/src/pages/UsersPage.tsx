import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../api'

export function UsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const size = 20

  const load = () => {
    setLoading(true)
    usersApi.list({ page, size })
      .then(r => { setUsers(r.data || []); setTotal(r.meta?.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Удалить пользователя ${email}?`)) return
    await usersApi.delete(id)
    load()
  }

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Изменить роль на «${newRole}»?`)) return
    await usersApi.update(id, { role: newRole })
    load()
  }

  const pages = Math.ceil(total / size)

  return (
    <div>
      <div className="row-between mb-24">
        <h1 className="page-title">Пользователи</h1>
        <span className="t-muted t-sm">Всего: {total}</span>
      </div>

      <div className="card card--bordered">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Регистрация</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет пользователей</td></tr>
              ) : users.map(u => (
                <tr key={u.id as string}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/users/${u.id}`} style={{ color: 'var(--gold-deep)', textDecoration: 'none' }}>
                      {u.first_name as string} {u.last_name as string}
                    </Link>
                  </td>
                  <td className="t-sm">{u.email as string}</td>
                  <td className="t-sm t-muted">{u.phone as string || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge--warn' : 'badge--neutral'}`}>
                      {u.role as string}
                    </span>
                  </td>
                  <td className="t-sm">{new Date(u.created_at as string).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <div className="data-table__actions">
                      <Link className="btn btn--ghost btn--sm" to={`/users/${u.id}`}>Открыть</Link>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleToggleRole(u.id as string, u.role as string)}>
                        {u.role === 'admin' ? 'Понизить' : 'Повысить'}
                      </button>
                      <button className="btn btn--sm" style={{ background: '#FFEBEE', color: 'var(--err)', border: 'none' }} onClick={() => handleDelete(u.id as string, u.email as string)}>
                        Удал.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="row" style={{ padding: '16px 20px', justifyContent: 'flex-end' }}>
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
