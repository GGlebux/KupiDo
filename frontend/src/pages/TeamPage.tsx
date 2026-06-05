import { Link } from 'react-router-dom'

const TEAM = [
  { name: 'Алексей Морозов', role: 'Генеральный директор', bio: 'Более 20 лет в девелопменте. Основал КупиДо в 2014 году.' },
  { name: 'Мария Соколова', role: 'Коммерческий директор', bio: 'Эксперт в продажах элитной недвижимости. Разработала систему клиентского сервиса.' },
  { name: 'Игорь Данилов', role: 'Главный архитектор', bio: 'Член Союза архитекторов России. Автор концепций всех жилых комплексов КупиДо.' },
  { name: 'Наталья Жукова', role: 'Финансовый директор', bio: 'MBA, Сколково. Выстроила финансовую систему, обеспечившую ни одной задержки выплат.' },
  { name: 'Дмитрий Климов', role: 'Директор по строительству', bio: '25 лет на стройке. Лично контролирует качество на каждом объекте.' },
  { name: 'Анна Петрова', role: 'Директор по маркетингу', bio: 'Создала узнаваемый бренд КупиДо. Спикер конференций по PropTech.' },
]

export function TeamPage() {
  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <Link to="/about">О компании</Link>
            <span>Команда</span>
          </nav>
          <div className="eyebrow">Люди КупиДо</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>
            Мы строим<br /><em>с душой</em>
          </h1>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="g-4" style={{ gap: 32 }}>
            {TEAM.map(m => (
              <div key={m.name} className="card card--bordered" style={{ padding: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
                  👤
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{m.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--gold-deep)', marginBottom: 12 }}>{m.role}</div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
