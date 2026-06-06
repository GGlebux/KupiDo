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
            <a
              href="https://vk.com/kupi_do"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Сообщество КупиДо ВКонтакте"
              className="row mt-20"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.473-2.507z"/>
              </svg>
              <span>Мы ВКонтакте</span>
            </a>
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
