import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { ProjectCard } from '../components/project/ProjectCard'
import { ProjectFilters } from '../components/project/ProjectFilters'
import { ConsultationModal } from '../components/modals/ConsultationModal'
import type { Project } from '../types'

interface Filters {
  location?: string
  type?: string
  deal_type?: string
  status?: string
  price_min?: number
  price_max?: number
}

const DEAL_LABELS: Record<string, string> = { sale: 'Покупка', rent: 'Аренда' }
const TYPE_LABELS: Record<string, string> = { multi_apartment: 'Квартиры', private_house_group: 'Загородные' }

export function ProjectsPage() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({})
  const [consultOpen, setConsultOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Синхронизируем фильтры с URL: ссылки из «Четырёх путей» / шапки
  // открывают каталог сразу с нужным фильтром (?type=…, ?deal=…).
  useEffect(() => {
    const f: Filters = {}
    const type = searchParams.get('type'); if (type) f.type = type
    const deal = searchParams.get('deal'); if (deal) f.deal_type = deal
    const status = searchParams.get('status'); if (status) f.status = status
    const location = searchParams.get('location'); if (location) f.location = location
    setFilters(f)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    projectsApi.list({ ...filters, size: 50 })
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false))
  }, [filters])

  const handleReset = () => setFilters({})
  const activeChips = [
    filters.deal_type && DEAL_LABELS[filters.deal_type],
    filters.type && TYPE_LABELS[filters.type],
  ].filter(Boolean) as string[]

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Каталог</span>
          </nav>
          <div className="row-between mb-40" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow">Каталог проектов</div>
              <h1 className="display mt-8" style={{ fontSize: 48, lineHeight: 1 }}>Найдите своё<br /><em>пространство</em></h1>
              {activeChips.length > 0 && (
                <div className="row mt-12" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {activeChips.map(c => <span key={c} className="tag tag--gold">{c}</span>)}
                </div>
              )}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className={`chip ${view === 'grid' ? 'is-active' : ''}`} onClick={() => setView('grid')}>
                ⊞ Сетка
              </button>
              <button className={`chip ${view === 'list' ? 'is-active' : ''}`} onClick={() => setView('list')}>
                ☰ Список
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ alignItems: 'flex-start' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <ProjectFilters filters={filters} onChange={setFilters} onReset={handleReset} />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              {loading ? (
                <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card" style={{ width: 320, height: 400, background: 'var(--surface-2)', borderRadius: 'var(--r-xl)', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
                  <h3 className="display" style={{ fontSize: 24 }}>Ничего не найдено</h3>
                  <p className="t-muted mt-8">Попробуйте изменить параметры фильтрации</p>
                  <button className="btn btn--ghost mt-24" onClick={handleReset}>Сбросить фильтры</button>
                </div>
              ) : (
                <div className={view === 'grid' ? 'g-3' : 'stack'} style={{ gap: 24 }}>
                  {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--ink)', color: 'var(--cream)', paddingTop: 80, paddingBottom: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>Не нашли подходящее?</div>
          <h2 className="display mt-16" style={{ fontSize: 40 }}>Расскажите о своих<br />пожеланиях</h2>
          <p className="t-muted mt-16" style={{ maxWidth: 480, margin: '16px auto 0' }}>
            Подберём варианты из закрытой базы или запишем в лист ожидания нового проекта
          </p>
          <button className="btn btn--gold btn--lg mt-32" onClick={() => setConsultOpen(true)}>
            Бесплатная консультация
          </button>
        </div>
      </section>

      <ConsultationModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  )
}
