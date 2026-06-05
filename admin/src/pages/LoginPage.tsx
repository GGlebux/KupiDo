import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'

export function LoginPage() {
  const [email, setEmail] = useState('admin@localhost')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    // На входе формат email не навязываем — учётные данные проверяет сервер.
    if (!email.trim()) { setError('Введите email'); return }
    if (password.length < 1) { setError('Введите пароль'); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
      <div className="card card--bordered" style={{ padding: 40, width: 380 }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>КупиДо</div>
          <div className="t-muted mt-4" style={{ fontSize: 13 }}>Панель управления</div>
        </div>

        {error && <div className="alert alert--err mb-16">{error}</div>}

        <form className="stack" style={{ gap: 16 }} onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field__label">Пароль</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
