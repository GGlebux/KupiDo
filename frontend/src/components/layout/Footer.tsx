import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Logo } from './Logo'

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <Link to="/" className="brand" style={{ marginBottom: 24 }}>
              <svg className="brand__mark" viewBox="0 0 40 40" fill="none">
                <path d="M6 22 L20 8 L34 22" stroke="#C9A961" strokeWidth="1.4"/>
                <path d="M9 21 L9 33 L31 33 L31 21" stroke="#F6F2E8" strokeWidth="1.2"/>
                <circle cx="20" cy="26.5" r="2.4" fill="#C9A961"/>
              </svg>
              <div>
                <div className="brand__name">Купи<b>До</b></div>
                <span className="brand__sub" style={{ color: 'rgba(255,255,255,.4)' }}>Real estate · est. 2014</span>
              </div>
            </Link>
            <p style={{ maxWidth: '32ch', color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
              Девелопер полного цикла. Проектируем, строим и сопровождаем жильё, в которое влюбляются.
            </p>
          </div>

          <div>
            <h4>Каталог</h4>
            <ul className="stack" style={{ gap: 10 }}>
              <li><Link to="/catalog">Все проекты</Link></li>
              <li><Link to="/catalog?type=multi_apartment">Квартиры</Link></li>
              <li><Link to="/catalog?type=private_house_group">Загородные дома</Link></li>
              <li><Link to="/catalog">Коммерция</Link></li>
              <li><Link to="/catalog">Аренда</Link></li>
            </ul>
          </div>

          <div>
            <h4>Сервисы</h4>
            <ul className="stack" style={{ gap: 10 }}>
              <li><Link to="/mortgage">Ипотека 0,1%</Link></li>
              <li><Link to="/services">Дом под заказ</Link></li>
              <li><Link to="/trade-in">Trade-in</Link></li>
              <li><Link to="/installment">Рассрочка</Link></li>
              <li><Link to="/deal-support">Сопровождение сделки</Link></li>
            </ul>
          </div>

          <div>
            <h4>Компания</h4>
            <ul className="stack" style={{ gap: 10 }}>
              <li><Link to="/about">О КупиДо</Link></li>
              <li><Link to="/team">Команда</Link></li>
              <li><Link to="/reviews">Отзывы</Link></li>
              <li><Link to="/guarantees">Гарантии</Link></li>
              <li><Link to="/documents">Документы</Link></li>
              <li><Link to="/contacts">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h4>Подписка</h4>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', maxWidth: '32ch' }}>
              Раз в месяц — старты продаж, спецпредложения и новые объекты.
            </p>
            <form className="mt-16" onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input" type="email" placeholder="ваш@email.ru" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.08)', color: 'var(--paper)' }}
                />
                <button type="submit" className="btn btn--gold">{subscribed ? '✓' : '→'}</button>
              </div>
            </form>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2014–2026 КупиДо · ОГРН 1147746000000</span>
          <span>Все права защищены · Версия 4.2</span>
        </div>
      </div>
    </footer>
  )
}
