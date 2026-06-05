import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '../store/authContext'
import { useToast } from '../store/toast'
import { useFavorites } from '../store/favorites'
import { bookingsApi } from '../api/bookings'
import { authApi } from '../api/auth'
import { ProjectCard } from '../components/project/ProjectCard'
import { UnitCard } from '../components/unit/UnitCard'
import { PhoneInput, RU_PHONE_RE } from '../components/PhoneInput'
import type { Booking } from '../types'

type Section = 'bookings' | 'profile' | 'favorites'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ProfileForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
}

export function ProfilePage() {
  const { user, logout, loading, refreshUser } = useAuth()
  const { notify } = useToast()
  const { favorites, loading: favLoading } = useFavorites()
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProfileForm>()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    bookingsApi.list()
      .then(r => setBookings(r.data || []))
      .finally(() => setBookingsLoading(false))
  }, [user])

  const startEdit = () => {
    if (!user) return
    reset({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      phone: user.phone || '',
      password: '',
    })
    setEditing(true)
  }

  const onSave = handleSubmit(async (data) => {
    setSaving(true)
    try {
      const payload: Record<string, string> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || '',
      }
      if (data.password) payload.password = data.password
      await authApi.updateMe(payload)
      await refreshUser()
      setEditing(false)
      notify('Профиль обновлён', 'success')
    } catch {
      notify('Не удалось сохранить. Возможно, email уже занят.', 'error')
    } finally {
      setSaving(false)
    }
  })

  const handleCancel = async (id: string) => {
    if (!confirm('Отменить бронирование?')) return
    await bookingsApi.cancel(id)
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  if (loading || !user) return null

  const fmt = (n?: number) => n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: 'На рассмотрении', cls: 'tag--pending' },
    confirmed: { label: 'Подтверждена', cls: 'tag--ok' },
    cancelled: { label: 'Отменена', cls: 'tag--err' },
  }

  const favProjects = favorites.filter(f => f.project)
  const favUnits = favorites.filter(f => f.unit)

  return (
    <section className="section-pad" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className="container">
        <div className="g-4" style={{ alignItems: 'flex-start' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="card card--bordered" style={{ padding: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gold-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span className="display" style={{ fontSize: 24, color: 'var(--gold-deep)' }}>
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div className="display" style={{ fontSize: 20 }}>{user.first_name} {user.last_name}</div>
              <div className="t-muted mt-4" style={{ fontSize: 13 }}>{user.email}</div>

              <nav className="stack mt-24" style={{ gap: 4 }}>
                {([
                  { id: 'bookings', label: 'Мои брони' },
                  { id: 'favorites', label: `Избранное${favorites.length ? ` · ${favorites.length}` : ''}` },
                  { id: 'profile', label: 'Профиль' },
                ] as { id: Section; label: string }[]).map(({ id, label }) => (
                  <button
                    key={id}
                    className={`label ${section === id ? '' : 't-muted'}`}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                      borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
                      background: section === id ? 'var(--gold-wash)' : 'transparent',
                      color: section === id ? 'var(--gold-deep)' : undefined,
                      transition: 'background .15s, color .15s'
                    }}
                    onClick={() => setSection(id)}
                  >
                    {label}
                  </button>
                ))}

                {user.role === 'admin' && (
                  <a
                    href="/admin"
                    className="label"
                    style={{ display: 'block', padding: '10px 14px', borderRadius: 'var(--r-md)', textDecoration: 'none', color: 'var(--gold-deep)', background: 'var(--gold-wash)', marginTop: 4 }}
                  >
                    → Панель управления
                  </a>
                )}
              </nav>

              <button
                className="btn btn--ghost btn--block mt-20"
                style={{ fontSize: 13 }}
                onClick={() => { logout(); navigate('/') }}
              >
                Выйти
              </button>
            </div>
          </div>

          <div style={{ gridColumn: 'span 3' }}>
            {section === 'bookings' && (
              <div>
                <h2 className="display" style={{ fontSize: 32, marginBottom: 32 }}>Мои брони</h2>
                {bookingsLoading ? (
                  <div className="t-muted">Загрузка...</div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                    <h3 className="display" style={{ fontSize: 22 }}>Брони пока нет</h3>
                    <p className="t-muted mt-8">Найдите квартиру в каталоге и оформите бронь</p>
                    <Link to="/catalog" className="btn btn--primary mt-24">Перейти в каталог</Link>
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 16 }}>
                    {bookings.map(b => {
                      const st = statusMap[b.status] || statusMap.pending
                      return (
                        <div key={b.id} className="card card--bordered" style={{ padding: 24 }}>
                          <div className="row-between" style={{ marginBottom: 16 }}>
                            <div>
                              <div className="display" style={{ fontSize: 20 }}>
                                {b.unit?.rooms ? `${b.unit.rooms}-комнатная` : 'Студия'}
                                {b.unit?.area && ` · ${b.unit.area} м²`}
                              </div>
                              <div className="t-muted mt-4" style={{ fontSize: 13 }}>
                                Забронировано {new Date(b.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                            <span className={`tag ${st.cls}`}>{st.label}</span>
                          </div>

                          <div className="row" style={{ gap: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            {b.unit?.price && (
                              <div>
                                <div className="label t-muted" style={{ fontSize: 11 }}>Стоимость</div>
                                <div style={{ fontWeight: 600, marginTop: 2 }}>{fmt(b.unit.price)}</div>
                              </div>
                            )}
                            {b.comment && (
                              <div>
                                <div className="label t-muted" style={{ fontSize: 11 }}>Комментарий</div>
                                <div style={{ fontSize: 13, marginTop: 2 }}>{b.comment}</div>
                              </div>
                            )}
                          </div>

                          {b.status === 'pending' && (
                            <div style={{ marginTop: 16 }}>
                              <button
                                className="btn btn--ghost"
                                style={{ fontSize: 13, height: 36, padding: '0 16px', color: 'var(--err)' }}
                                onClick={() => handleCancel(b.id)}
                              >
                                Отменить бронь
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {section === 'favorites' && (
              <div>
                <h2 className="display" style={{ fontSize: 32, marginBottom: 32 }}>Избранное</h2>
                {favLoading ? (
                  <div className="t-muted">Загрузка...</div>
                ) : favorites.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
                    <h3 className="display" style={{ fontSize: 22 }}>Список пуст</h3>
                    <p className="t-muted mt-8">Добавляйте объекты в избранное, нажав на сердечко</p>
                    <Link to="/catalog" className="btn btn--primary mt-24">Перейти в каталог</Link>
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 40 }}>
                    {favProjects.length > 0 && (
                      <div>
                        <div className="label t-muted mb-16">Проекты · {favProjects.length}</div>
                        <div className="g-3" style={{ gap: 24 }}>
                          {favProjects.map(f => <ProjectCard key={f.id} project={f.project!} />)}
                        </div>
                      </div>
                    )}
                    {favUnits.length > 0 && (
                      <div>
                        <div className="label t-muted mb-16">Квартиры · {favUnits.length}</div>
                        <div className="g-3" style={{ gap: 20 }}>
                          {favUnits.map(f => <UnitCard key={f.id} unit={f.unit!} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {section === 'profile' && (
              <div>
                <h2 className="display" style={{ fontSize: 32, marginBottom: 32 }}>Профиль</h2>
                <div className="card card--bordered" style={{ padding: 28, maxWidth: 520 }}>
                  {editing ? (
                    <form className="stack" style={{ gap: 16 }} onSubmit={onSave} noValidate>
                      <div className="g-2" style={{ gap: 16 }}>
                        <div className="field">
                          <label className="field__label">Имя</label>
                          <input className="input" {...register('first_name', { required: 'Укажите имя' })} />
                          {errors.first_name && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.first_name.message}</span>}
                        </div>
                        <div className="field">
                          <label className="field__label">Фамилия</label>
                          <input className="input" {...register('last_name', { required: 'Укажите фамилию' })} />
                          {errors.last_name && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.last_name.message}</span>}
                        </div>
                      </div>
                      <div className="field">
                        <label className="field__label">Email</label>
                        <input className="input" type="email" {...register('email', { required: 'Укажите email', pattern: { value: EMAIL_RE, message: 'Некорректный email' } })} />
                        {errors.email && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.email.message}</span>}
                      </div>
                      <div className="field">
                        <label className="field__label">Телефон</label>
                        <Controller
                          name="phone"
                          control={control}
                          rules={{ validate: v => !v || RU_PHONE_RE.test(v) || 'Введите номер +7 (XXX) XXX-XX-XX' }}
                          render={({ field }) => <PhoneInput value={field.value || ''} onChange={field.onChange} />}
                        />
                        {errors.phone && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.phone.message}</span>}
                      </div>
                      <div className="field">
                        <label className="field__label">Новый пароль (необязательно)</label>
                        <input className="input" type="password" placeholder="оставьте пустым, чтобы не менять" {...register('password', { validate: v => !v || v.length >= 6 || 'Минимум 6 символов' })} />
                        {errors.password && <span style={{ fontSize: 12, color: 'var(--err)' }}>{errors.password.message}</span>}
                      </div>
                      <div className="row" style={{ gap: 12 }}>
                        <button className="btn btn--primary" type="submit" disabled={saving}>
                          {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button className="btn btn--ghost" type="button" onClick={() => setEditing(false)}>Отмена</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="stack" style={{ gap: 20 }}>
                        {[
                          { label: 'Имя', value: user.first_name },
                          { label: 'Фамилия', value: user.last_name },
                          { label: 'Email', value: user.email },
                          { label: 'Телефон', value: user.phone || 'Не указан' },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div className="label t-muted" style={{ fontSize: 11 }}>{label}</div>
                            <div style={{ marginTop: 4, fontWeight: 500 }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn--ghost btn--block mt-24" onClick={startEdit}>Редактировать профиль</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
