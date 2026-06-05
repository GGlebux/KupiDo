import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { unitsApi, projectsApi } from '../api'
import { PhotoManager, type PhotoManagerHandle } from '../components/PhotoManager'

interface FormValues {
  project_id: string
  type: string
  area: string
  floor: string
  rooms: string
  price: string
  status: string
  description: string
}

export function UnitFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<Record<string, unknown>[]>([])
  const pmRef = useRef<PhotoManagerHandle>(null)

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { type: 'apartment', status: 'available' }
  })
  const projectIdVal = watch('project_id')

  useEffect(() => {
    projectsApi.list({ size: 100 }).then(r => setProjects(r.data || []))
    if (!isNew) {
      unitsApi.get(id!)
        .then(u => reset({
          project_id: String(u.project_id),
          type: u.type,
          area: String(u.area),
          floor: u.floor ? String(u.floor) : '',
          rooms: u.rooms ? String(u.rooms) : '',
          price: u.price ? String(u.price) : '',
          status: u.status,
          description: u.description || '',
        }))
        .catch(() => setError('Квартира не найдена'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew, reset])

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...data,
        area: Number(data.area),
        floor: data.floor ? Number(data.floor) : null,
        rooms: data.rooms ? Number(data.rooms) : null,
        price: data.price ? Number(data.price) : null,
      }
      if (isNew) {
        const created = await unitsApi.create(payload)
        // Догружаем фото, добавленные до сохранения квартиры.
        try { await pmRef.current?.flush(String(created.project_id), created.id) } catch { /* можно добавить позже */ }
        navigate(`/units/${created.id}`)
      } else {
        await unitsApi.update(id!, payload)
        navigate('/units')
      }
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  })

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Загрузка...</div>

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="row-between mb-24">
        <h1 className="page-title">{isNew ? 'Новая квартира' : 'Редактировать квартиру'}</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/units')}>← Назад</button>
      </div>

      {error && <div className="alert alert--err mb-16">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="card card--bordered" style={{ padding: 28 }}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label className="field__label">Проект *</label>
              <select className="select" required {...register('project_id')}>
                <option value="">Выберите проект</option>
                {projects.map(p => (
                  <option key={p.id as string} value={p.id as string}>{p.title as string}</option>
                ))}
              </select>
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Тип *</label>
                <select className="select" required {...register('type')}>
                  <option value="apartment">Квартира</option>
                  <option value="studio">Студия</option>
                  <option value="penthouse">Пентхаус</option>
                  <option value="house">Дом</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label">Статус</label>
                <select className="select" {...register('status')}>
                  <option value="available">Доступна</option>
                  <option value="booked">Забронирована</option>
                  <option value="sold">Продана</option>
                </select>
              </div>
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Площадь (м²) *</label>
                <input className="input" type="number" step="0.1" required {...register('area')} />
              </div>
              <div className="field">
                <label className="field__label">Этаж</label>
                <input className="input" type="number" {...register('floor')} />
              </div>
            </div>
            <div className="g-2" style={{ gap: 16 }}>
              <div className="field">
                <label className="field__label">Комнат (0 = студия)</label>
                <input className="input" type="number" min="0" {...register('rooms')} />
              </div>
              <div className="field">
                <label className="field__label">Цена (₽)</label>
                <input className="input" type="number" {...register('price')} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Описание</label>
              <textarea className="textarea" {...register('description')} />
            </div>
          </div>
        </div>

        <div className="card card--bordered mt-16" style={{ padding: 28 }}>
          <div className="section-title mb-16">Фотографии квартиры</div>
          {projectIdVal ? (
            <PhotoManager ref={pmRef} projectId={projectIdVal} unitId={isNew ? undefined : id} target="unit" />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Сначала выберите проект, чтобы добавить фото.</p>
          )}
        </div>

        <div className="row mt-16" style={{ gap: 12 }}>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/units')}>Отмена</button>
        </div>
      </form>
    </div>
  )
}
