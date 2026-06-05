import { Link } from 'react-router-dom'

const DOCS = [
  { category: 'Разрешения', items: [
    { name: 'Разрешение на строительство ЖК «Полянка 18»', date: '15.03.2024', type: 'PDF' },
    { name: 'Разрешение на строительство ЖК «Северный Парк»', date: '22.07.2024', type: 'PDF' },
  ]},
  { category: 'Проектные декларации', items: [
    { name: 'Проектная декларация ЖК «Полянка 18»', date: '01.04.2024', type: 'PDF' },
    { name: 'Проектная декларация ЖК «Северный Парк»', date: '10.08.2024', type: 'PDF' },
  ]},
  { category: 'Финансовые документы', items: [
    { name: 'Аудиторское заключение за 2023 год', date: '30.04.2024', type: 'PDF' },
    { name: 'Аудиторское заключение за 2022 год', date: '28.04.2023', type: 'PDF' },
  ]},
  { category: 'Учредительные документы', items: [
    { name: 'Устав ООО «КупиДо Девелопмент»', date: '12.01.2014', type: 'PDF' },
    { name: 'ОГРН и ИНН', date: '12.01.2014', type: 'PDF' },
  ]},
]

export function DocumentsPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/about">О компании</Link>
            <span>Документы</span>
          </nav>
          <div className="eyebrow">Прозрачность</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Все документы<br /><em>в открытом доступе</em>
          </h1>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="stack" style={{ gap: 40 }}>
            {DOCS.map(cat => (
              <div key={cat.category}>
                <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  {cat.category}
                </h2>
                <div className="stack" style={{ gap: 12 }}>
                  {cat.items.map(doc => (
                    <div key={doc.name} className="card card--bordered" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Обновлено: {doc.date}</div>
                      </div>
                      <button className="btn btn--ghost btn--sm" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                        ↓ {doc.type}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 24, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)' }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
              Все документы размещены в соответствии с требованиями Федерального закона № 214-ФЗ
              «Об участии в долевом строительстве». Если вы не нашли нужный документ,
              обратитесь в наш офис или напишите на <a href="mailto:docs@kupido.ru" style={{ color: 'var(--gold-deep)' }}>docs@kupido.ru</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
