interface Filters {
  rooms?: number
  status?: string
  min_area?: number
  max_area?: number
  min_price?: number
  max_price?: number
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onReset: () => void
}

export function UnitFilters({ filters, onChange, onReset }: Props) {
  return (
    <div className="card card--bordered" style={{ padding: 24, position: 'sticky', top: 120 }}>
      <div className="row-between mb-24">
        <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Фильтры</h3>
        <button className="label t-gold" onClick={onReset}>Сбросить</button>
      </div>

      <div className="field mb-24">
        <label className="field__label mb-8">Комнат</label>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {['Студия', '1', '2', '3', '4+'].map((r, i) => (
            <button
              key={r}
              className={`chip ${filters.rooms === i ? 'is-active' : ''}`}
              onClick={() => onChange({ ...filters, rooms: filters.rooms === i ? undefined : i })}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="field mb-24">
        <label className="field__label">Площадь, м²</label>
        <div className="row" style={{ gap: 8 }}>
          <input className="input" placeholder="от" style={{ height: 42 }} type="number"
            value={filters.min_area || ''}
            onChange={e => onChange({ ...filters, min_area: e.target.value ? +e.target.value : undefined })}
          />
          <input className="input" placeholder="до" style={{ height: 42 }} type="number"
            value={filters.max_area || ''}
            onChange={e => onChange({ ...filters, max_area: e.target.value ? +e.target.value : undefined })}
          />
        </div>
      </div>

      <div className="field mb-24">
        <label className="field__label">Цена, млн ₽</label>
        <div className="row" style={{ gap: 8 }}>
          <input className="input" placeholder="от" style={{ height: 42 }} type="number"
            value={filters.min_price ? filters.min_price / 1e6 : ''}
            onChange={e => onChange({ ...filters, min_price: e.target.value ? +e.target.value * 1e6 : undefined })}
          />
          <input className="input" placeholder="до" style={{ height: 42 }} type="number"
            value={filters.max_price ? filters.max_price / 1e6 : ''}
            onChange={e => onChange({ ...filters, max_price: e.target.value ? +e.target.value * 1e6 : undefined })}
          />
        </div>
      </div>

      <div className="field mb-24">
        <label className="field__label mb-8">Статус</label>
        {[['available', 'Доступна'], ['booked', 'Забронирована']].map(([val, label]) => (
          <label key={val} className="check" style={{ marginBottom: 8 }}>
            <input type="checkbox"
              checked={!filters.status || filters.status === val}
              onChange={() => onChange({ ...filters, status: filters.status === val ? undefined : val })}
            />
            <span className="check__box"></span>
            {label}
          </label>
        ))}
      </div>

      <button className="btn btn--primary btn--block" onClick={() => onChange({ ...filters })}>
        Применить
      </button>
    </div>
  )
}
