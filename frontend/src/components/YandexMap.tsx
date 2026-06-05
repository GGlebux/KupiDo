interface Props {
  /** Адрес или название точки для поиска на карте */
  query: string
  height?: number
  zoom?: number
  className?: string
}

/**
 * Встраиваемая Яндекс.Карта по адресу (виджет, не требует API-ключа).
 * Используется на странице контактов и в карточке проекта (вкладка «Расположение»).
 */
export function YandexMap({ query, height = 360, zoom = 16, className }: Props) {
  const src =
    `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(query)}` +
    `&z=${zoom}&l=map`

  return (
    <div
      className={className}
      style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', height, background: 'var(--surface-2)' }}
    >
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{ border: 0, display: 'block' }}
        title={`Карта: ${query}`}
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}
