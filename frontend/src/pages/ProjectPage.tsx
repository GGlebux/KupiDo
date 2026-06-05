import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { unitsApi } from '../api/units'
import { ProjectGallery } from '../components/project/ProjectGallery'
import { YandexMap } from '../components/YandexMap'
import { UnitCard } from '../components/unit/UnitCard'
import { ConsultationModal } from '../components/modals/ConsultationModal'
import { BookingModal } from '../components/modals/BookingModal'
import { AuthModal } from '../components/modals/AuthModal'
import type { Project, Unit } from '../types'

type Tab = 'about' | 'units' | 'location' | 'docs'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('about')
  const [consultOpen, setConsultOpen] = useState(false)
  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    projectsApi.get(slug)
      .then(async proj => {
        setProject(proj)
        const u = await unitsApi.listByProject(proj.id)
        setUnits(u.data || [])
      }).finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container section-pad" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div className="t-muted">Загрузка проекта...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container section-pad" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 className="display">Проект не найден</h2>
        <Link to="/catalog" className="btn btn--ghost mt-24">← Назад к каталогу</Link>
      </div>
    )
  }

  const fmt = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'
  const fmtM = (n?: number) => n ? `от ${new Intl.NumberFormat('ru-RU').format(Math.round(n / 1e6))} млн ₽` : '—'
  const availableCount = units.filter(u => u.status === 'available').length

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <span>{project.title}</span>
          </nav>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="container">
          <div className="g-4" style={{ alignItems: 'flex-start', gap: 48 }}>
            <div style={{ gridColumn: 'span 3' }}>
              <ProjectGallery photos={(project.photos || []).filter(p => !p.unit_id)} projectTitle={project.title} />

              <div className="row mt-32" style={{ gap: 0, borderBottom: '1px solid var(--border)' }}>
                {(['about', 'units', 'location', 'docs'] as Tab[]).map(t => (
                  <button
                    key={t}
                    className={`label ${tab === t ? '' : 't-muted'}`}
                    style={{
                      padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
                      borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                      marginBottom: -1, transition: 'color .15s, border-color .15s'
                    }}
                    onClick={() => setTab(t)}
                  >
                    {{ about: 'О проекте', units: `Планировки (${units.length})`, location: 'Расположение', docs: 'Документы' }[t]}
                  </button>
                ))}
              </div>

              <div className="mt-32">
                {tab === 'about' && (
                  <div>
                    <p className="t-body" style={{ fontSize: 17, lineHeight: 1.8, maxWidth: 680 }}>
                      {project.description || 'Описание проекта появится скоро.'}
                    </p>
                    <div className="g-3 mt-40" style={{ gap: 24 }}>
                      {[
                        { label: 'Адрес', value: project.address },
                        { label: 'Статус', value: { active: 'Строится', sold_out: 'Продано', upcoming: 'Скоро' }[project.status] },
                        { label: 'Срок сдачи', value: project.deadline ? new Date(project.deadline).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }) : '—' },
                        { label: 'Квартир в продаже', value: availableCount },
                        { label: 'Цены от', value: fmtM(project.price_from) },
                        { label: 'Тип', value: project.type === 'multi_apartment' ? 'Многоквартирный дом' : 'Малоэтажный жилой комплекс' },
                      ].map(({ label, value }) => (
                        <div key={label} className="card card--bordered" style={{ padding: 20 }}>
                          <div className="label t-muted" style={{ fontSize: 11 }}>{label}</div>
                          <div className="display mt-4" style={{ fontSize: 18 }}>{value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'units' && (
                  <div>
                    {units.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <p className="t-muted">Планировки появятся скоро</p>
                      </div>
                    ) : (
                      <div className="g-3" style={{ gap: 20 }}>
                        {units.map(u => (
                          <UnitCard
                            key={u.id}
                            unit={u}
                            onBook={() => setBookingUnit(u)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'location' && (
                  <div>
                    <p className="t-body" style={{ marginBottom: 24 }}>
                      <strong>{project.address || project.location}</strong>
                    </p>
                    <YandexMap
                      query={project.address || project.location || project.title}
                      height={400}
                    />
                    {project.location && (
                      <p className="t-muted mt-12" style={{ fontSize: 13 }}>📍 {project.location}</p>
                    )}
                  </div>
                )}

                {tab === 'docs' && (
                  <div>
                    <p className="t-muted">Проектная документация и разрешения</p>
                    <div className="stack mt-24" style={{ gap: 12 }}>
                      {['Разрешение на строительство', 'Проектная декларация', 'Договор долевого участия (шаблон)', 'Поэтажные планы'].map(doc => (
                        <div key={doc} className="card card--bordered row" style={{ padding: '16px 20px', gap: 12, alignItems: 'center' }}>
                          <span style={{ fontSize: 20 }}>📄</span>
                          <span style={{ flex: 1, fontSize: 14 }}>{doc}</span>
                          <span className="label t-gold" style={{ cursor: 'pointer' }}>Скачать</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ gridColumn: 'span 1', position: 'sticky', top: 120 }}>
              <div className="card card--bordered" style={{ padding: 28 }}>
                <div className="eyebrow">Цена от</div>
                <div className="display mt-8" style={{ fontSize: 36 }}>{fmtM(project.price_from)}</div>
                <div className="label t-muted mt-4">{availableCount} квартир в наличии</div>

                <div className="stack mt-24" style={{ gap: 12 }}>
                  <button className="btn btn--primary btn--block btn--lg" onClick={() => { setTab('units') }}>
                    Смотреть планировки
                  </button>
                  <button className="btn btn--ghost btn--block" onClick={() => setConsultOpen(true)}>
                    Получить консультацию
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20 }}>
                  <div className="label t-muted mb-12">Объект</div>
                  <div className="stack" style={{ gap: 8 }}>
                    {project.deadline && (
                      <div className="row-between">
                        <span className="t-muted" style={{ fontSize: 13 }}>Срок сдачи</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {new Date(project.deadline).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    )}
                    <div className="row-between">
                      <span className="t-muted" style={{ fontSize: 13 }}>Статус</span>
                      <span className={`tag tag--${project.status === 'active' ? 'ok' : project.status === 'upcoming' ? 'pending' : 'err'}`} style={{ fontSize: 11 }}>
                        {{ active: 'Строится', sold_out: 'Продано', upcoming: 'Скоро' }[project.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-16" style={{ padding: 20, background: 'var(--gold-wash)' }}>
                <div className="label" style={{ color: 'var(--gold-deep)', fontSize: 11 }}>Ипотека от</div>
                <div className="display mt-4" style={{ fontSize: 22 }}>4.9%</div>
                <p className="t-muted mt-8" style={{ fontSize: 12 }}>Партнёрские программы с ведущими банками</p>
                <Link to="/mortgage" className="label t-gold mt-12" style={{ display: 'block', fontSize: 13 }}>Рассчитать →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 80, background: 'var(--surface-2)', marginTop: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow">Есть вопросы?</div>
          <h2 className="display mt-16" style={{ fontSize: 40 }}>Свяжитесь с нами</h2>
          <button className="btn btn--primary btn--lg mt-24" onClick={() => setConsultOpen(true)}>
            Заказать звонок
          </button>
        </div>
      </section>

      <ConsultationModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} projectId={project.id} />
      <BookingModal
        unit={bookingUnit}
        projectTitle={project.title}
        isOpen={!!bookingUnit}
        onClose={() => setBookingUnit(null)}
        onAuthRequired={() => setAuthOpen(true)}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
