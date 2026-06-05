import { Link } from 'react-router-dom'
import type { Unit } from '../../types'
import { useFavorites } from '../../store/favorites'

interface Props { unit: Unit; onBook?: () => void }

const STATUS_LABELS: Record<string, string> = {
  available: 'Доступна',
  booked: 'Забронирована',
  sold: 'Продана',
}
const STATUS_TAG: Record<string, string> = {
  available: 'tag--ok',
  booked: 'tag--warn',
  sold: 'tag--err',
}
const TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  studio: 'Студия',
  penthouse: 'Пентхаус',
}

export function UnitCard({ unit, onBook }: Props) {
  const { isUnitFav, toggleUnit } = useFavorites()
  const fav = isUnitFav(unit.id)
  const fmt = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'
  const label = unit.rooms ? `${unit.rooms}к` : TYPE_LABELS[unit.type || 'apartment'] || 'Объект'
  const cover = unit.photos?.find(p => p.is_cover) ?? unit.photos?.[0]

  return (
    <Link to={`/units/${unit.id}`} className="card" style={{ padding: 20, background: 'var(--paper)' }}>
      <div className={cover ? '' : 'ph'} style={{ aspectRatio: '1/1', background: 'var(--paper-2)', position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
        {cover && (
          <img
            src={cover.url}
            alt={cover.caption || label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className={`tag ${STATUS_TAG[unit.status]}`}>
            <span className="tag__dot"></span>{STATUS_LABELS[unit.status]}
          </span>
        </div>
        <button
          type="button"
          className={`fav-btn ${fav ? 'is-active' : ''}`}
          style={{ position: 'absolute', top: 12, right: 12 }}
          title={fav ? 'Убрать из избранного' : 'В избранное'}
          aria-label="В избранное"
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleUnit(unit.id) }}
        >
          {fav ? '♥' : '♡'}
        </button>
        {!cover && <span className="ph__tag">{label} · {unit.area} м²</span>}
      </div>
      <div className="mt-16 row-between">
        <div>
          <div style={{ fontWeight: 500 }}>{label} · {unit.area}&nbsp;м²</div>
          {unit.floor && <div className="label mt-4">{unit.floor} этаж</div>}
        </div>
        <div className="u-right">
          <div className="t-num" style={{ fontWeight: 500 }}>{unit.price ? (unit.price / 1e6).toFixed(1) + ' млн' : '—'}</div>
          <div className="label mt-4">от</div>
        </div>
      </div>
      {onBook && unit.status === 'available' && (
        <button
          className="btn btn--primary btn--block mt-12"
          style={{ fontSize: 13, height: 38 }}
          onClick={e => { e.preventDefault(); onBook() }}
        >
          Забронировать
        </button>
      )}
    </Link>
  )
}
