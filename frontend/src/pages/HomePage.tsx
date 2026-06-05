import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { consultationsApi } from '../api/consultations'
import { reviewsApi } from '../api/reviews'
import { ProjectCard } from '../components/project/ProjectCard'
import { useAuth } from '../store/authContext'
import { PhoneInput, RU_PHONE_RE } from '../components/PhoneInput'
import type { Project, Review } from '../types'

function useMortgage(price = 15000000, down = 3000000, years = 20, rate = 18.9) {
  const loan = price - down
  const r = rate / 100 / 12
  const n = years * 12
  const monthly = loan > 0 ? (loan * r) / (1 - Math.pow(1 + r, -n)) : 0
  const monthlyFav = loan > 0 ? (loan * 0.001 / 12) / (1 - Math.pow(1 + 0.001 / 12, -n)) : 0
  return { monthly: Math.round(monthly), monthlyFav: Math.round(monthlyFav), total: Math.round(monthly * n) }
}

export function HomePage({ onConsultClick }: { onConsultClick?: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [mortPrice, setMortPrice] = useState(15000000)
  const [mortDown, setMortDown] = useState(3000000)
  const [mortYears, setMortYears] = useState(20)
  const { monthly, monthlyFav, total } = useMortgage(mortPrice, mortDown, mortYears)
  const [ctaName, setCtaName] = useState('')
  const [ctaPhone, setCtaPhone] = useState('')
  const [ctaSent, setCtaSent] = useState(false)
  const [ctaError, setCtaError] = useState('')

  useEffect(() => {
    projectsApi.list({ size: 6 }).then(r => setProjects(r.data))
    reviewsApi.list({ size: 3 }).then(r => setReviews(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setCtaName([user.first_name, user.last_name].filter(Boolean).join(' '))
      setCtaPhone(user.phone || '')
    }
  }, [user])

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n)

  const handleCta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!RU_PHONE_RE.test(ctaPhone)) { setCtaError('Введите номер +7 (XXX) XXX-XX-XX'); return }
    try {
      setCtaError('')
      await consultationsApi.create({ name: ctaName, phone: ctaPhone })
      setCtaSent(true)
    } catch {
      setCtaError('Не удалось отправить заявку. Попробуйте ещё раз.')
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <div>
              <div className="eyebrow">Квартира · Дом · Коммерция · Под заказ</div>
              <h1 className="display hero__title mt-24">
                Дом,<br />в&nbsp;который <em>влюбляются</em>.
              </h1>
              <p className="lead hero__sub">
                Девелопер премиум-класса. 17 кварталов в Москве и области, 8 600 семей нашли свой дом с нами — без посредников и переплат.
              </p>
              <div className="row mt-32" style={{ gap: 16 }}>
                <Link to="/catalog" className="btn btn--primary btn--lg">Смотреть каталог</Link>
                <Link to="/services" className="btn btn--ghost btn--lg">Дом под заказ →</Link>
              </div>
              <div className="row mt-48" style={{ gap: 48 }}>
                <div>
                  <div className="display" style={{ fontSize: 42, lineHeight: 1 }}>17</div>
                  <div className="label mt-8">проектов</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 42, lineHeight: 1 }}>8.6k</div>
                  <div className="label mt-8">сданных квартир</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 42, lineHeight: 1 }}>12&nbsp;лет</div>
                  <div className="label mt-8">на рынке</div>
                </div>
              </div>
            </div>
            <div className="hero__visual ph">
              <span className="ph__tag">Фасад · ЖК «Полянка 18»</span>
              <svg viewBox="0 0 400 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: .35 }} aria-hidden="true">
                <g stroke="#14110D" strokeWidth=".7" fill="none">
                  <rect x="40" y="80" width="320" height="380"/>
                  <line x1="40" y1="160" x2="360" y2="160"/>
                  <line x1="40" y1="240" x2="360" y2="240"/>
                  <line x1="40" y1="320" x2="360" y2="320"/>
                  <line x1="40" y1="400" x2="360" y2="400"/>
                  <line x1="120" y1="80" x2="120" y2="460"/>
                  <line x1="200" y1="80" x2="200" y2="460"/>
                  <line x1="280" y1="80" x2="280" y2="460"/>
                </g>
                <g fill="#C9A961">
                  <rect x="124" y="164" width="72" height="72" opacity=".3"/>
                  <rect x="204" y="244" width="72" height="72" opacity=".25"/>
                  <rect x="44" y="324" width="72" height="72" opacity=".18"/>
                </g>
              </svg>
              <div style={{ position: 'absolute', top: 24, right: 24, padding: '8px 12px', background: 'var(--paper)', borderRadius: 999, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                Старт продаж · сегодня
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="hero__bar">
            <div className="seg">
              <span className="seg__label">Что ищете</span>
              <span className="seg__val">Квартира в Москве</span>
            </div>
            <div className="seg">
              <span className="seg__label">Локация</span>
              <span className="seg__val">Любой район</span>
            </div>
            <div className="seg">
              <span className="seg__label">Цена, млн ₽</span>
              <span className="seg__val">от 8 до 60</span>
            </div>
            <div className="seg">
              <span className="seg__label">Комнаты</span>
              <span className="seg__val">1 · 2 · 3+</span>
            </div>
            <Link to="/catalog" className="btn btn--gold btn--lg" style={{ margin: '0 8px' }}>
              Найти · {projects.length ? '247' : '...'}
            </Link>
          </div>
        </div>
      </section>

      {/* PROPOSITION STRIP */}
      <section style={{ background: 'var(--paper-2)', borderBlock: '1px solid var(--line-soft)' }}>
        <div className="container" style={{ padding: '32px 0' }}>
          <div className="g-4">
            {[
              ['01', 'Своя стройка', 'Без подрядчиков и наценок'],
              ['02', 'Ипотека 0,1%', 'Первый год — почти даром'],
              ['03', 'Trade-in за 3 дня', 'Меняем старое на новое'],
              ['04', '10 лет гарантии', 'На конструктив и инженерию'],
            ].map(([num, title, sub]) => (
              <div key={num} className="row" style={{ gap: 14 }}>
                <span className="display" style={{ fontSize: 32, color: 'var(--gold-deep)' }}>{num}</span>
                <div>
                  <div className="u-mono u-up" style={{ fontSize: 11 }}>{title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Проекты года</div>
              <h2 className="display section-head__title mt-12">Семнадцать кварталов,<br /><em>один почерк</em>.</h2>
            </div>
            <div className="section-head__sub">
              Каждый проект — от концепции до благоустройства — мы&nbsp;ведём сами. Поэтому архитектура, материалы и&nbsp;дворы выдержаны в&nbsp;одной интонации.
              <div className="mt-24"><Link to="/catalog" className="btn btn--ghost">Все&nbsp;проекты&nbsp;·&nbsp;17</Link></div>
            </div>
          </div>
          <div className="g-3">
            {projects.slice(0, 3).map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
          {projects.length > 3 && (
            <div className="g-3 mt-48">
              {projects.slice(3, 6).map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" style={{ background: 'var(--dark)', color: 'var(--paper)' }}>
        <div className="container">
          <div className="section-head" style={{ borderBottomColor: 'rgba(255,255,255,.1)' }}>
            <div>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,.4)' }}>Что мы делаем</div>
              <h2 className="display section-head__title mt-12">Четыре пути<br />к&nbsp;<em>своему дому</em>.</h2>
            </div>
            <div className="section-head__sub" style={{ color: 'rgba(255,255,255,.6)' }}>
              Продажа готового, аренда, загород и&nbsp;строительство по&nbsp;вашему проекту — под одной крышей.
            </div>
          </div>
          <div className="g-4">
            {[
              { num: '01', title: 'Купить', sub: 'Квартиры, дома, коммерция, участки. Объекты в продаже.', href: '/catalog?deal=sale', gold: false },
              { num: '02', title: 'Арендовать', sub: 'Долгосрочная аренда жилья и помещений. Договор за час.', href: '/catalog?deal=rent', gold: false },
              { num: '03', title: 'Загород', sub: 'Готовые коттеджи, таунхаусы и участки в посёлках.', href: '/catalog?type=private_house_group', gold: false },
              { num: '04', title: 'Построить', sub: 'Индивидуальный проект под ключ. От концепции до ключей за 14 месяцев.', href: '/services', gold: true },
            ].map(({ num, title, sub, href, gold }) => (
              <Link
                key={num}
                to={href}
                className="card"
                style={{
                  background: gold ? 'var(--gold)' : 'rgba(255,255,255,.03)',
                  border: '1px solid ' + (gold ? 'transparent' : 'rgba(255,255,255,.06)'),
                  padding: 32, display: 'block'
                }}
              >
                <div className="display" style={{ fontSize: 54, lineHeight: 1, color: gold ? 'var(--ink)' : 'var(--gold)' }}>{num}</div>
                <h3 className="display mt-24" style={{ fontSize: 28, color: gold ? 'var(--ink)' : 'var(--paper)' }}>{title}</h3>
                <p className="mt-12" style={{ color: gold ? 'var(--ink-2)' : 'rgba(255,255,255,.55)', fontSize: 14 }}>{sub}</p>
                <div className="u-mono u-up mt-24" style={{ fontSize: 11, color: gold ? 'var(--ink)' : 'var(--gold)' }}>Подробнее&nbsp;→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MORTGAGE PREVIEW */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Ипотека 0,1%</div>
              <h2 className="display section-head__title mt-12">Платёж первого года<br />как <em>чашка кофе</em>&nbsp;в&nbsp;день.</h2>
            </div>
            <div className="section-head__sub">
              Субсидируем ставку первый год — освобождаем бюджет на&nbsp;ремонт и&nbsp;переезд.
              <div className="mt-24"><Link to="/mortgage" className="btn btn--ghost">Полный калькулятор&nbsp;→</Link></div>
            </div>
          </div>
          <div className="g-12">
            <div style={{ gridColumn: 'span 5' }}>
              <div className="stack" style={{ gap: 24 }}>
                <div className="field">
                  <label className="field__label">Стоимость · {fmt(mortPrice)} ₽</label>
                  <input className="slider" type="range" min={5000000} max={100000000} step={500000} value={mortPrice} onChange={e => setMortPrice(+e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label">Первый взнос · {fmt(mortDown)} ₽ · {Math.round(mortDown / mortPrice * 100)}%</label>
                  <input className="slider" type="range" min={0} max={50000000} step={100000} value={mortDown} onChange={e => setMortDown(+e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label">Срок · {mortYears} лет</label>
                  <input className="slider" type="range" min={1} max={30} value={mortYears} onChange={e => setMortYears(+e.target.value)} />
                </div>
                <Link to="/mortgage" className="btn btn--primary btn--lg mt-16">Получить одобрение онлайн →</Link>
              </div>
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <div className="card card--bordered" style={{ padding: 32, height: '100%' }}>
                <div className="eyebrow">Стандартная ставка</div>
                <div className="display mt-12" style={{ fontSize: 80 }}>18,9<span style={{ fontSize: 32 }}>%</span></div>
                <hr className="mt-24" />
                <div className="label mt-24">Ежемесячный платёж</div>
                <div className="display mt-8" style={{ fontSize: 38 }}>{fmt(monthly)}&nbsp;₽</div>
                <div className="label mt-24">Переплата за весь срок</div>
                <div className="t-num mt-8" style={{ fontSize: 18 }}>{fmt(total)}&nbsp;₽</div>
              </div>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <div className="card" style={{ background: 'var(--ink)', color: 'var(--paper)', padding: 32, height: '100%', position: 'relative' }}>
                <div className="eyebrow" style={{ color: 'var(--gold)' }}>Ипотека 0,1% · 1 год</div>
                <div className="display mt-12" style={{ fontSize: 80, color: 'var(--paper)' }}>0,1<span style={{ fontSize: 32 }}>%</span></div>
                <hr className="mt-24" style={{ borderColor: 'rgba(255,255,255,.1)' }} />
                <div className="label mt-24" style={{ color: 'rgba(255,255,255,.5)' }}>Платёж первого года</div>
                <div className="display mt-8 t-gold" style={{ fontSize: 38 }}>{fmt(monthlyFav)}&nbsp;₽</div>
                <span className="tag tag--gold" style={{ position: 'absolute', top: 24, right: 24 }}>Выгодно</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Слово жителей</div>
              <h2 className="display section-head__title mt-12">Истории <em>о&nbsp;доме</em>.</h2>
            </div>
            <div className="section-head__sub">
              Только реальные отзывы наших клиентов.
              <div className="mt-24"><Link to="/reviews" className="btn btn--ghost">Все отзывы&nbsp;→</Link></div>
            </div>
          </div>
          {reviews.length === 0 ? (
            <div className="card card--bordered" style={{ padding: 40, textAlign: 'center' }}>
              <p className="t-muted">Отзывов пока нет. <Link to="/reviews" className="t-gold">Оставьте первый →</Link></p>
            </div>
          ) : (
            <div className="g-3">
              {reviews.map((r, idx) => {
                const dark = idx === 1
                const author = [r.user?.first_name, r.user?.last_name].filter(Boolean).join(' ') || 'Клиент КупиДо'
                return (
                  <figure key={r.id} className="card" style={{ background: dark ? 'var(--ink)' : 'transparent', border: dark ? 'none' : '1px solid var(--line)', padding: 32 }}>
                    <div className="stars" style={{ color: 'var(--gold-deep)', fontSize: 18 }}>
                      {[1, 2, 3, 4, 5].map(i => <span key={i}>{i <= r.rating ? '★' : '☆'}</span>)}
                    </div>
                    <blockquote className="display mt-12" style={{ fontSize: 24, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.3, color: dark ? 'var(--paper)' : 'inherit' }}>
                      «{r.text}»
                    </blockquote>
                    <figcaption className="mt-32 row" style={{ gap: 12 }}>
                      <span className={`ph${dark ? ' ph--dark' : ''}`} style={{ width: 42, height: 42, borderRadius: '50%' }}></span>
                      <div>
                        <div style={{ fontWeight: 500, color: dark ? 'var(--paper)' : 'inherit' }}>{author}</div>
                        <div className="label" style={{ color: dark ? 'rgba(255,255,255,.5)' : '' }}>
                          {r.project?.title ? `${r.project.title} · ` : ''}
                          {new Date(r.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gold)', padding: '96px 0' }}>
        <div className="container">
          <div className="g-12" style={{ alignItems: 'center' }}>
            <div style={{ gridColumn: 'span 7' }}>
              <div className="eyebrow" style={{ color: 'var(--ink)' }}>Подбор за 15 минут</div>
              <h2 className="display mt-12" style={{ fontSize: 'clamp(40px, 5vw, 80px)', color: 'var(--ink)' }}>
                Расскажите,<br />каким вы видите <em>свой&nbsp;дом</em>.
              </h2>
            </div>
            <div style={{ gridColumn: 'span 5' }}>
              {ctaSent ? (
                <div className="card" style={{ background: 'rgba(255,255,255,.3)', padding: 32, borderRadius: 'var(--r-xl)' }}>
                  <div className="display" style={{ fontSize: 28 }}>✓ Заявка отправлена!</div>
                  <p className="mt-12">Перезвоним в течение часа.</p>
                </div>
              ) : !user ? (
                <div className="card" style={{ background: 'rgba(255,255,255,.3)', padding: 32, borderRadius: 'var(--r-xl)' }}>
                  <div className="display" style={{ fontSize: 24 }}>Войдите, чтобы оставить заявку</div>
                  <p className="mt-12" style={{ color: 'var(--ink-2)' }}>Заявки принимаются от&nbsp;авторизованных клиентов.</p>
                  <button className="btn btn--primary btn--lg btn--block mt-16" onClick={() => navigate('/login')}>
                    Войти / Зарегистрироваться
                  </button>
                </div>
              ) : (
                <form className="stack" style={{ gap: 16 }} onSubmit={handleCta} noValidate>
                  {ctaError && <p style={{ color: 'var(--err)', fontSize: 13 }}>{ctaError}</p>}
                  <div className="field">
                    <label className="field__label" style={{ color: 'var(--ink-2)' }}>Ваше имя</label>
                    <input className="input" placeholder="Как к вам обращаться" required style={{ background: 'rgba(255,255,255,.4)', borderColor: 'rgba(20,17,13,.15)' }} value={ctaName} onChange={e => setCtaName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label" style={{ color: 'var(--ink-2)' }}>Телефон</label>
                    <PhoneInput value={ctaPhone} onChange={setCtaPhone} style={{ background: 'rgba(255,255,255,.4)', borderColor: 'rgba(20,17,13,.15)' }} />
                  </div>
                  <button className="btn btn--primary btn--lg btn--block" type="submit">
                    Записаться на консультацию
                  </button>
                  <p className="label" style={{ color: 'rgba(20,17,13,.55)' }}>Нажимая, вы соглашаетесь с политикой обработки данных</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
