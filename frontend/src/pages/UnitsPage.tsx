import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { unitsApi } from '../api/units'
import { UnitCard } from '../components/unit/UnitCard'
import { UnitFilters } from '../components/unit/UnitFilters'
import { BookingModal } from '../components/modals/BookingModal'
import { AuthModal } from '../components/modals/AuthModal'
import type { Project, Unit } from '../types'

interface Filters {
  rooms?: number
  status?: string
  min_area?: number
  max_area?: number
  min_price?: number
  max_price?: number
}

export function UnitsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [filtered, setFiltered] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({})
  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    projectsApi.get(slug)
      .then(async proj => {
        setProject(proj)
        const u = await unitsApi.listByProject(proj.id)
        const items = u.data || []
        setUnits(items)
        setFiltered(items)
      }).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    let result = [...units]
    if (filters.rooms !== undefined) result = result.filter(u => u.rooms === filters.rooms)
    if (filters.status) result = result.filter(u => u.status === filters.status)
    if (filters.min_area) result = result.filter(u => u.area >= filters.min_area!)
    if (filters.max_area) result = result.filter(u => u.area <= filters.max_area!)
    if (filters.min_price) result = result.filter(u => !u.price || u.price >= filters.min_price!)
    if (filters.max_price) result = result.filter(u => !u.price || u.price <= filters.max_price!)
    setFiltered(result)
  }, [filters, units])

  const handleReset = () => setFilters({})

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            {project && <Link to={`/catalog/${slug}`}>{project.title}</Link>}
            <span>Планировки</span>
          </nav>
          <div className="mb-40">
            <div className="eyebrow">Выбор квартиры</div>
            <h1 className="display mt-8" style={{ fontSize: 44, lineHeight: 1 }}>
              {project ? project.title : 'Загрузка...'}
            </h1>
            <p className="t-muted mt-12">{filtered.length} квартир доступно</p>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <UnitFilters filters={filters} onChange={setFilters} onReset={handleReset} />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              {loading ? (
                <div className="t-muted" style={{ padding: '40px 0' }}>Загрузка планировок...</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                  <h3 className="display" style={{ fontSize: 24 }}>Ничего не найдено</h3>
                  <p className="t-muted mt-8">Попробуйте изменить параметры</p>
                  <button className="btn btn--ghost mt-24" onClick={handleReset}>Сбросить фильтры</button>
                </div>
              ) : (
                <div className="g-3" style={{ gap: 20 }}>
                  {filtered.map(u => (
                    <UnitCard key={u.id} unit={u} onBook={() => setBookingUnit(u)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        unit={bookingUnit}
        projectTitle={project?.title}
        isOpen={!!bookingUnit}
        onClose={() => setBookingUnit(null)}
        onAuthRequired={() => setAuthOpen(true)}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
