import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reviewsApi } from '../api/reviews'
import { useAuth } from '../store/authContext'
import { useToast } from '../store/toast'
import type { Review } from '../types'

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map(i => <span key={i}>{i <= value ? '★' : '☆'}</span>)}
    </span>
  )
}

function authorName(r: Review) {
  const n = [r.user?.first_name, r.user?.last_name].filter(Boolean).join(' ')
  return n || 'Клиент КупиДо'
}

export function ReviewsPage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    reviewsApi.list({ size: 50 })
      .then(r => setReviews(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 3) { notify('Напишите хотя бы несколько слов', 'error'); return }
    setSubmitting(true)
    try {
      await reviewsApi.create({ rating, text: text.trim() })
      // Отзыв публикуется только после модерации — в общий список пока не добавляем.
      setText('')
      setRating(5)
      notify('Спасибо! Отзыв отправлен на модерацию.', 'success')
    } catch {
      notify('Не удалось отправить отзыв', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1).replace('.', ',')
    : '—'

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="container">
          <nav className="breadcrumb mb-24">
            <Link to="/">Главная</Link>
            <span>Отзывы</span>
          </nav>
          <div className="eyebrow">Слово жителей</div>
          <h1 className="display mt-8" style={{ fontSize: 52, lineHeight: 1 }}>Отзывы<br /><em>наших клиентов</em></h1>
          <p className="t-muted mt-20" style={{ maxWidth: 540, fontSize: 17 }}>
            Только реальные отзывы от&nbsp;авторизованных покупателей.
            {reviews.length > 0 && <> Средняя оценка — <b>{avg}</b> из&nbsp;5 ({reviews.length}).</>}
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="container">
          {/* Форма отзыва */}
          <div className="card card--bordered mb-40" style={{ padding: 32, maxWidth: 720 }}>
            <h2 className="display" style={{ fontSize: 24, marginBottom: 16 }}>Оставить отзыв</h2>
            {user ? (
              <form className="stack" style={{ gap: 16 }} onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field__label">Ваша оценка</label>
                  <div className="stars stars--input" style={{ fontSize: 28 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} onClick={() => setRating(i)} role="button" aria-label={`${i} звёзд`}>
                        {i <= rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Отзыв</label>
                  <textarea
                    className="textarea" style={{ minHeight: 100 }}
                    placeholder="Расскажите о своём опыте покупки и жизни в проекте..."
                    value={text} onChange={e => setText(e.target.value)}
                  />
                </div>
                <button className="btn btn--primary" type="submit" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                  {submitting ? 'Отправляем...' : 'Отправить отзыв'}
                </button>
                <p className="label t-muted" style={{ fontSize: 12 }}>Отзыв появится на сайте после проверки модератором.</p>
              </form>
            ) : (
              <div>
                <p className="t-muted" style={{ marginBottom: 16 }}>
                  Отзывы могут оставлять только авторизованные клиенты — так мы гарантируем их подлинность.
                </p>
                <Link to="/login" className="btn btn--primary">Войти и оставить отзыв</Link>
              </div>
            )}
          </div>

          {/* Список отзывов */}
          {loading ? (
            <div className="t-muted" style={{ padding: '40px 0' }}>Загрузка отзывов...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <h3 className="display" style={{ fontSize: 24 }}>Отзывов пока нет</h3>
              <p className="t-muted mt-8">Станьте первым, кто поделится впечатлениями</p>
            </div>
          ) : (
            <div className="g-3" style={{ gap: 24 }}>
              {reviews.map(r => (
                <figure key={r.id} className="card card--bordered" style={{ padding: 28, margin: 0 }}>
                  <Stars value={r.rating} />
                  <blockquote className="mt-12" style={{ fontSize: 16, lineHeight: 1.6, fontStyle: 'italic' }}>
                    «{r.text}»
                  </blockquote>
                  <figcaption className="mt-20 row" style={{ gap: 12, alignItems: 'center' }}>
                    <span className="ph" style={{ width: 40, height: 40, borderRadius: '50%' }}></span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{authorName(r)}</div>
                      <div className="label t-muted">
                        {r.project?.title ? `${r.project.title} · ` : ''}
                        {new Date(r.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
