import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'
import { useFavorites } from '../../store/favorites'

interface Props {
  project: Project
}

export function ProjectCard({ project }: Props) {
  const navigate = useNavigate()
  const { isProjectFav, toggleProject } = useFavorites()
  const fav = isProjectFav(project.id)

  const fmt = (n?: number) =>
    n ? (n / 1_000_000).toFixed(1).replace('.', ',') + ' млн ₽' : 'по запросу'

  const cover = project.photos?.find(p => p.is_cover) ?? project.photos?.[0]
  const open = () => navigate(`/catalog/${project.slug}`)

  return (
    <article
      className="proj-card proj-card--link"
      onClick={open}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') open() }}
    >
      <div className="proj-card__img" style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface-2)' }}>
        {cover ? (
          <img
            src={cover.url}
            alt={cover.caption || project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <rect width="48" height="48" rx="12" fill="var(--gold)" opacity=".15" />
              <path d="M12 36l9-12 6 8 5-6 8 10H12z" fill="var(--gold)" opacity=".4" />
              <circle cx="32" cy="18" r="4" fill="var(--gold)" opacity=".4" />
            </svg>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Фото появятся скоро</span>
          </div>
        )}

        <button
          type="button"
          className={`fav-btn ${fav ? 'is-active' : ''}`}
          style={{ position: 'absolute', top: 12, right: 12 }}
          title={fav ? 'Убрать из избранного' : 'В избранное'}
          aria-label="В избранное"
          onClick={e => { e.stopPropagation(); toggleProject(project.id) }}
        >
          {fav ? '♥' : '♡'}
        </button>

        {project.status === 'upcoming' && (
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span className="tag tag--gold">Старт продаж</span>
          </div>
        )}
        {project.photos && project.photos.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(20,17,13,.6)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
            {project.photos.length} фото
          </div>
        )}
      </div>
      <div className="proj-card__meta">
        <h3 className="proj-card__title">{project.title}</h3>
        {project.deal_type === 'rent' && <span className="tag">Аренда</span>}
        {project.type === 'private_house_group' && <span className="tag">Загород</span>}
      </div>
      <div className="proj-card__loc">
        {project.location}
        {project.deadline && ` · сдача ${new Date(project.deadline).getFullYear()}`}
      </div>
      <div className="proj-card__price">
        <span>от <b>{fmt(project.price_from)}</b></span>
        <span className="t-gold u-mono u-up" style={{ fontSize: 11 }}>
          Смотреть →
        </span>
      </div>
    </article>
  )
}
