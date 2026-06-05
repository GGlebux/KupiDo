import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../store/authContext'
import { Logo } from './Logo'
import { AuthModal } from '../modals/AuthModal'
import { ConsultationModal } from '../modals/ConsultationModal'

const NAV_ITEMS = [
  ['/catalog', 'Каталог'],
  ['/mortgage', 'Ипотека'],
  ['/installment', 'Рассрочка'],
  ['/reviews', 'Отзывы'],
  ['/contacts', 'Контакты'],
]

export function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [callbackOpen, setCallbackOpen] = useState(false)

  return (
    <>
    <header className="site-header">
      <div className="site-header__top">
        <div className="container row-between">
          <div className="row" style={{ gap: 24 }}>
            <span>Москва · ул. Большая Полянка, 18</span>
            <span className="t-muted">Офис продаж — ежедневно 9:00–21:00</span>
          </div>
          <div className="row" style={{ gap: 24 }}>
            <Link to="/investors" className="t-muted">Инвесторам</Link>
            <Link to="/residents" className="t-muted">Для жителей</Link>
            <Link to="/vacancies" className="t-muted">Вакансии</Link>
            <button className="t-gold" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }} onClick={() => setCallbackOpen(true)}>Заказать звонок</button>
          </div>
        </div>
      </div>
      <div className="container site-header__main">
        <Link to="/" className="brand">
          <Logo />
          <div>
            <div className="brand__name">Купи<b>До</b></div>
            <span className="brand__sub">Real estate · est. 2014</span>
          </div>
        </Link>

        <nav className="nav">
          {NAV_ITEMS.map(([href, label]) => (
            <Link
              key={href}
              to={href}
              className={pathname === href.split('?')[0] ? 'is-active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-phone">
            <span className="header-phone__num">+7 495 186-42-04</span>
            <span className="header-phone__sub">круглосуточно</span>
          </div>
          {user ? (
            <>
              <Link to="/profile" className="icon-btn" title="Профиль">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
                </svg>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="icon-btn" title="Админ-панель">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
                    <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
                  </svg>
                </Link>
              )}
              <button className="btn btn--outline btn--sm" onClick={logout}>Выйти</button>
            </>
          ) : (
            <button className="btn btn--outline btn--sm" onClick={() => setAuthOpen(true)}>Войти</button>
          )}
        </div>
      </div>
    </header>
    <AuthModal isOpen={authOpen && !user} onClose={() => setAuthOpen(false)} />
    <ConsultationModal isOpen={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </>
  )
}
