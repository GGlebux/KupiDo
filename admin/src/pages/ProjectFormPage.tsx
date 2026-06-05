import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { projectsApi } from '../api'
import { PhotoManager, type PhotoManagerHandle } from '../components/PhotoManager'

interface FormValues {
  title: string
  slug: string
  type: string
  deal_type: string
  status: string
  description: string
  location: string
  address: string
  price_from: string
  deadline: string
}

export function ProjectFormPage() {
  const { slug } = useParams<{ slug?: string }>()
  const isNew = !slug || slug === 'new'
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [projectId, setProjectId] = useState('')
  const pmRef = useRef<PhotoManagerHandle>(null)

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { type: 'multi_apartment', deal_type: 'sale', status: 'active' }
  })

  const titleVal = watch('title')

  useEffect(() => {
    if (isNew) return
    projectsApi.get(slug!)
      .then(p => {
        setProjectId(p.id)
        reset({
          title: p.title,
          slug: p.slug,
          type: p.type,
          deal_type: p.deal_type || 'sale',
          status: p.status,
          description: p.description || '',
          location: p.location || '',
          address: p.address || '',
          price_from: p.price_from ? String(p.price_from) : '',
          deadline: p.deadline || '',
        })
      })
      .catch(() => setError('Проект не найден'))
      .finally(() => setLoading(false))
  }, [slug, isNew, reset])

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...data,
        price_from: data.price_from ? Number(data.price_from) : null,
        deadline: data.deadline || null,
      }
      if (isNew) {
        const created = await projectsApi.create(payload)
        setProjectId(created.id)
        // Догружаем фото, добавленные в форме до сохранения.
        try { await pmRef.current?.flush(created.id) } catch { /* фото можно добавить позже */ }
        navigate(`/projects/${created.slug}`)
      } else {
        await projectsApi.update(projectId, payload)
        navigate('/projects')
      }
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  })

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Загрузка...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="row-between mb-24">
        <h1 className="page-title">{isNew ? 'Новый проект' : `Редактировать: ${titleVal}`}</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/projects')}>← Назад</button>
      </div>

      {error && <div className="alert alert--err mb-16">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="card card--bordered" style={{ padding: 28, marginBottom: 20 }}>
          <div className="section-title mb-20">Основная информация</div>
          <div className="stack" style={{ gap: 16 }}>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Название *</label>
                <input className="input" required {...register('title')} />
              </div>
              <div className="field">
                <label className="field__label">Slug *</label>
                <input className="input" required {...register('slug')} placeholder="polyanka-18" />
              </div>
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Тип</label>
                <select className="select" {...register('type')}>
                  <option value="multi_apartment">Многоквартирный дом</option>
                  <option value="private_house_group">Малоэтажный ЖК</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label">Статус</label>
                <select className="select" {...register('status')}>
                  <option value="active">Строится</option>
                  <option value="upcoming">Скоро</option>
                  <option value="sold_out">Продан</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Тип сделки</label>
              <select className="select" {...register('deal_type')}>
                <option value="sale">Продажа</option>
                <option value="rent">Аренда</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label">Описание</label>
              <textarea className="textarea" {...register('description')} />
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Район / Локация</label>
                <input className="input" {...register('location')} placeholder="Замоскворечье" />
              </div>
              <div className="field">
                <label className="field__label">Адрес</label>
                <input className="input" {...register('address')} placeholder="ул. Полянка, 18" />
              </div>
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Цена от (₽)</label>
                <input className="input" type="number" {...register('price_from')} placeholder="12500000" />
              </div>
              <div className="field">
                <label className="field__label">Срок сдачи</label>
                <input className="input" type="date" {...register('deadline')} />
              </div>
            </div>
          </div>
        </div>

        <div className="card card--bordered" style={{ padding: 28, marginBottom: 20 }}>
          <div className="section-title mb-16">Фотографии галереи</div>
          <PhotoManager ref={pmRef} projectId={projectId} target="project" />
        </div>

        <div className="row" style={{ gap: 12 }}>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/projects')}>Отмена</button>
        </div>
      </form>
    </div>
  )
}
