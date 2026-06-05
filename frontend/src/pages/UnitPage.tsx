import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { unitsApi } from '../api/units'
import { BookingModal } from '../components/modals/BookingModal'
import { AuthModal } from '../components/modals/AuthModal'
import { ProjectGallery } from '../components/project/ProjectGallery'
import type { Unit } from '../types'

export function UnitPage() {
  const { id } = useParams<{ id: string }>()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    unitsApi.get(id)
      .then(setUnit)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="container section-pad" style={{ textAlign: 'center', padding: '120px 24px' }}><div className="t-muted">Загрузка...</div></div>
  }

  if (!unit) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 className="display">Квартира не найдена</h2>
        <Link to="/catalog" className="btn btn--ghost mt-24">← К каталогу</Link>
      </div>
    )
  }

  const fmt = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'
  const fmtM = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(Math.round(n / 1e6)) + ' млн ₽' : '—'
  const label = unit.rooms ? `${unit.rooms}-комнатная` : 'Студия'
  const statusMap: Record<string, { label: string; cls: string }> = {
    available: { label: 'Доступна', cls: 'tag--ok' },
    booked: { label: 'Забронирована', cls: 'tag--pending' },
    sold: { label: 'Продана', cls: 'tag--err' },
  }
  const st = statusMap[unit.status] || statusMap.available

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <span>{label} · {unit.area} м²</span>
          </nav>

          <div className="g-4" style={{ gap: 48, alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <span className={`tag ${st.cls}`}>{st.label}</span>
                {unit.floor && <span className="label t-muted">{unit.floor} этаж</span>}
              </div>
              <h1 className="display" style={{ fontSize: 48, lineHeight: 1 }}>
                {label}<br />
                <span style={{ color: 'var(--muted)', fontSize: 32 }}>{unit.area}&nbsp;м²</span>
              </h1>

              <div className="card card--bordered mt-32" style={{ padding: 24 }}>
                <div className="g-3" style={{ gap: 20 }}>
                  {[
                    { label: 'Площадь', value: `${unit.area} м²` },
                    { label: 'Этаж', value: unit.floor || '—' },
                    { label: 'Комнат', value: unit.rooms || 'Студия' },
                    { label: 'Тип', value: { apartment: 'Квартира', house: 'Дом', studio: 'Студия', penthouse: 'Пентхаус' }[unit.type] || unit.type },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="label t-muted" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
                      <div className="display" style={{ fontSize: 20 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-40">
                <h3 className="display" style={{ fontSize: 22, marginBottom: 20 }}>
                  {unit.photos && unit.photos.length > 0 ? 'Фотографии и планировка' : 'Планировка'}
                </h3>
                {unit.photos && unit.photos.length > 0 ? (
                  <ProjectGallery photos={unit.photos} projectTitle={label} />
                ) : (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-xl)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 16, opacity: .3 }}>
                        <rect x="8" y="8" width="64" height="64" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="8" y="8" width="32" height="40" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="40" y="8" width="32" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="40" y="28" width="32" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                      <p style={{ fontSize: 14 }}>Планировка загружается</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ gridColumn: 'span 1', position: 'sticky', top: 120 }}>
              <div className="card card--bordered" style={{ padding: 28 }}>
                <div className="eyebrow">Стоимость</div>
                <div className="display mt-8" style={{ fontSize: 40, lineHeight: 1 }}>{fmtM(unit.price)}</div>
                <div className="label t-muted mt-4">{fmt(unit.price)}</div>

                {unit.price && unit.area && (
                  <div className="label t-muted mt-4" style={{ fontSize: 12 }}>
                    {new Intl.NumberFormat('ru-RU').format(Math.round(unit.price / unit.area))} ₽/м²
                  </div>
                )}

                <div className="stack mt-24" style={{ gap: 10 }}>
                  {unit.status === 'available' ? (
                    <button className="btn btn--primary btn--block btn--lg" onClick={() => setBookingOpen(true)}>
                      Забронировать
                    </button>
                  ) : (
                    <button className="btn btn--primary btn--block btn--lg" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>
                      {unit.status === 'booked' ? 'Забронировано' : 'Продано'}
                    </button>
                  )}
                  <Link to="/mortgage" className="btn btn--ghost btn--block" style={{ textAlign: 'center' }}>
                    Рассчитать ипотеку
                  </Link>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20 }}>
                  <p className="t-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                    Бронь действует 5 рабочих дней. Залог 30&nbsp;000&nbsp;₽ возвращается при отказе.
                  </p>
                </div>
              </div>

              {unit.price && (
                <div className="card mt-16" style={{ padding: 20, background: 'var(--gold-wash)' }}>
                  <div className="label" style={{ color: 'var(--gold-deep)', fontSize: 11 }}>Ипотечный платёж от</div>
                  <div className="display mt-4" style={{ fontSize: 24 }}>
                    {new Intl.NumberFormat('ru-RU').format(Math.round(unit.price * 0.8 * 0.049 / 12 / (1 - Math.pow(1 + 0.049 / 12, -240))))} ₽/мес
                  </div>
                  <p className="t-muted mt-4" style={{ fontSize: 11 }}>При ПВ 20%, на 20 лет, 4.9% годовых</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        unit={unit}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onAuthRequired={() => { setBookingOpen(false); setAuthOpen(true) }}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
