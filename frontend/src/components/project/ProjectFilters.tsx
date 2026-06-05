import { useState } from 'react'

interface Filters {
  type?: string
  deal_type?: string
  status?: string
  location?: string
  price_min?: number
  price_max?: number
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onReset: () => void
}

export function ProjectFilters({ filters, onChange, onReset }: Props) {
  return (
    <div className="card card--bordered" style={{ padding: 24, position: 'sticky', top: 120 }}>
      <div className="row-between mb-24">
        <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Фильтры</h3>
        <button className="label t-gold" onClick={onReset}>Сбросить</button>
      </div>

      <div className="field mb-24">
        <label className="field__label">Локация</label>
        <select
          className="select"
          value={filters.location || ''}
          onChange={e => onChange({ ...filters, location: e.target.value || undefined })}
        >
          <option value="">Москва · все районы</option>
          <option>Якиманка</option>
          <option>Лефортово</option>
          <option>Замоскворечье</option>
          <option>Хамовники</option>
          <option>Тверской</option>
          <option>Истринский р-н</option>
        </select>
      </div>

      <div className="field mb-24">
        <label className="field__label">Тип сделки</label>
        <select
          className="select"
          value={filters.deal_type || ''}
          onChange={e => onChange({ ...filters, deal_type: e.target.value || undefined })}
        >
          <option value="">Покупка и аренда</option>
          <option value="sale">Покупка</option>
          <option value="rent">Аренда</option>
        </select>
      </div>

      <div className="field mb-24">
        <label className="field__label">Тип</label>
        <select
          className="select"
          value={filters.type || ''}
          onChange={e => onChange({ ...filters, type: e.target.value || undefined })}
        >
          <option value="">Все типы</option>
          <option value="multi_apartment">Многоквартирный</option>
          <option value="private_house_group">Загородный посёлок</option>
        </select>
      </div>

      <div className="field mb-24">
        <label className="field__label">Цена, млн ₽</label>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input" placeholder="от" style={{ height: 42 }}
            type="number" value={filters.price_min ? filters.price_min / 1e6 : ''}
            onChange={e => onChange({ ...filters, price_min: e.target.value ? +e.target.value * 1e6 : undefined })}
          />
          <input
            className="input" placeholder="до" style={{ height: 42 }}
            type="number" value={filters.price_max ? filters.price_max / 1e6 : ''}
            onChange={e => onChange({ ...filters, price_max: e.target.value ? +e.target.value * 1e6 : undefined })}
          />
        </div>
      </div>

      <div className="field mb-24">
        <label className="field__label mb-8">Статус</label>
        {[['active', 'Активный'], ['upcoming', 'Старт продаж'], ['sold_out', 'Распродан']].map(([val, label]) => (
          <label key={val} className="check" style={{ marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={!filters.status || filters.status === val}
              onChange={() => onChange({ ...filters, status: filters.status === val ? undefined : val })}
            />
            <span className="check__box"></span>
            {label}
          </label>
        ))}
      </div>

      <button
        className="btn btn--primary btn--block"
        onClick={() => onChange({ ...filters })}
      >
        Показать проекты
      </button>
    </div>
  )
}
