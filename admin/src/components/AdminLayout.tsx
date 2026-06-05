import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'

const navItems = [
  { group: 'Недвижимость', items: [
    { to: '/projects', label: 'Проекты', icon: '🏗' },
    { to: '/units', label: 'Квартиры', icon: '🏠' },
  ]},
  { group: 'Продажи', items: [
    { to: '/bookings', label: 'Бронирования', icon: '📋' },
    { to: '/consultations', label: 'Заявки', icon: '📞' },
    { to: '/reviews', label: 'Отзывы', icon: '⭐' },
  ]},
  { group: 'Пользователи', items: [
    { to: '/users', label: 'Клиенты', icon: '👤' },
  ]},
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand__name">КупиДо</div>
          <div className="sidebar-brand__sub">Административная панель</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav__group">Обзор</div>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Дашборд
          </NavLink>

          {navItems.map(({ group, items }) => (
            <div key={group}>
              <div className="sidebar-nav__group">{group}</div>
              {items.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
                  <span>{icon}</span> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ color: 'rgba(246,242,232,.5)', fontSize: 12, marginBottom: 8 }}>
            {(user?.email as string) || ''}
          </div>
          <button className="btn btn--ghost btn--sm" style={{ color: 'rgba(246,242,232,.5)', borderColor: 'rgba(255,255,255,.1)', width: '100%' }} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <span style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {(user?.first_name as string) || ''} {(user?.last_name as string) || ''}
          </div>
        </header>
        <main className="admin-page">
          {children}
        </main>
      </div>
    </div>
  )
}
