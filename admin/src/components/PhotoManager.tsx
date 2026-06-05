import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { photosApi } from '../api'

interface Item {
  id?: string          // есть у уже сохранённых фото
  tempId?: string      // у ещё не загруженных (режим создания)
  url: string          // ссылка или object-URL для превью
  file?: File          // файл, ожидающий загрузки
  persisted: boolean
}

export interface PhotoManagerHandle {
  /** Загрузить отложенные фото после создания объекта (проекта/квартиры). */
  flush: (projectId: string, unitId?: string) => Promise<void>
  hasPending: () => boolean
}

interface Props {
  projectId?: string
  unitId?: string
  /** Что редактируем: фото проекта или фото квартиры. */
  target?: 'project' | 'unit'
}

let tempCounter = 0

/**
 * Управление фотографиями (проекта или квартиры).
 *  - Перетаскивание карточек мышью меняет порядок в галерее (как карточки).
 *  - В формах создания (объект ещё не сохранён) фото копятся локально
 *    и загружаются после создания через flush().
 */
export const PhotoManager = forwardRef<PhotoManagerHandle, Props>(function PhotoManager(
  { projectId, unitId, target },
  ref,
) {
  const mode: 'project' | 'unit' = target ?? (unitId !== undefined ? 'unit' : 'project')
  // «Готов» — объект уже существует, можно грузить сразу на сервер.
  const ready = mode === 'unit' ? !!unitId : !!projectId

  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const dragIdx = useRef<number | null>(null)

  useEffect(() => {
    if (!ready) return
    const loader = mode === 'unit' && unitId
      ? photosApi.listByUnit(unitId)
      : projectId ? photosApi.listByProject(projectId) : Promise.resolve([])
    loader
      .then(ps => setItems((ps || []).map(p => ({ id: p.id as string, url: p.url as string, persisted: true }))))
      .catch(() => {})
  }, [projectId, unitId, ready, mode])

  useImperativeHandle(ref, () => ({
    hasPending: () => items.some(i => !i.persisted),
    flush: async (newProjectId: string, newUnitId?: string) => {
      const pending = items.filter(i => !i.persisted)
      const created: { id: string }[] = []
      for (const it of pending) {
        if (it.file) {
          const fd = new FormData()
          fd.append('file', it.file)
          fd.append('project_id', newProjectId)
          if (newUnitId) fd.append('unit_id', newUnitId)
          const photo = await photosApi.upload(fd)
          created.push(photo as { id: string })
        } else {
          const photo = await photosApi.fromUrl({ project_id: newProjectId, unit_id: newUnitId, url: it.url })
          created.push(photo as { id: string })
        }
      }
      // Сохраняем порядок, в котором их расставили в форме.
      await Promise.all(created.map((p, i) => photosApi.updateOrder(p.id, i)))
    },
  }), [items])

  const persistOrder = async (ordered: Item[]) => {
    const persisted = ordered.filter(i => i.persisted && i.id)
    await Promise.all(persisted.map((p, i) => photosApi.updateOrder(p.id as string, i)))
  }

  const addFile = async (file: File) => {
    setError('')
    if (!file.type.startsWith('image/')) { setError('Можно загружать только изображения'); return }
    if (ready) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('project_id', (mode === 'unit' ? projectIdForUnit() : projectId) || '')
        if (mode === 'unit' && unitId) fd.append('unit_id', unitId)
        const photo = await photosApi.upload(fd)
        setItems(prev => [...prev, { id: photo.id as string, url: photo.url as string, persisted: true }])
      } catch {
        setError('Ошибка загрузки фото')
      } finally {
        setUploading(false)
      }
    } else {
      // Отложенная загрузка — копим до создания объекта.
      const previewUrl = URL.createObjectURL(file)
      setItems(prev => [...prev, { tempId: `t${++tempCounter}`, url: previewUrl, file, persisted: false }])
    }
  }

  // Для фото квартиры project_id берётся из выбранного в форме проекта.
  const projectIdForUnit = () => projectId

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await addFile(file)
    e.target.value = ''
  }

  const handleDropZone = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setDropZoneActive(false)
    if (dragIdx.current !== null) return
    const file = e.dataTransfer.files?.[0]
    if (file) await addFile(file)
  }

  const handleUrlAdd = async () => {
    const url = urlInput.trim()
    if (!url) return
    setError('')
    if (ready) {
      setUrlLoading(true)
      try {
        const photo = await photosApi.fromUrl({
          project_id: (mode === 'unit' ? projectIdForUnit() : projectId),
          unit_id: mode === 'unit' ? unitId : undefined,
          url,
        })
        setItems(prev => [...prev, { id: photo.id as string, url: photo.url as string, persisted: true }])
        setUrlInput('')
      } catch {
        setError('Ошибка добавления по URL')
      } finally {
        setUrlLoading(false)
      }
    } else {
      setItems(prev => [...prev, { tempId: `t${++tempCounter}`, url, persisted: false }])
      setUrlInput('')
    }
  }

  const handleDelete = async (idx: number) => {
    const it = items[idx]
    if (it.persisted && it.id) {
      await photosApi.delete(it.id)
    } else if (it.file) {
      URL.revokeObjectURL(it.url)
    }
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const move = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return
    const reordered = [...items]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setItems(reordered)
    if (reordered.every(i => i.persisted)) await persistOrder(reordered)
  }

  const handleDragStart = (idx: number) => { dragIdx.current = idx }
  const handleDropOnPhoto = async (targetIdx: number) => {
    const from = dragIdx.current
    dragIdx.current = null
    if (from === null) return
    await move(from, targetIdx)
  }

  return (
    <div>
      {error && <div className="alert alert--err mb-16">{error}</div>}
      {!ready && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Фото добавятся к объекту автоматически после сохранения.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {items.map((photo, idx) => (
          <div
            key={photo.id || photo.tempId}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDropOnPhoto(idx)}
            style={{ position: 'relative', cursor: 'grab', width: 120 }}
            title="Перетащите, чтобы изменить порядок"
          >
            <img
              src={photo.url}
              alt=""
              style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, display: 'block', border: '2px solid transparent' }}
              onError={e => { (e.target as HTMLImageElement).style.background = '#eee' }}
            />
            <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>
              #{idx + 1}{!photo.persisted && ' • ожидает'}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
            >✕</button>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 14, padding: '20px 0' }}>Фото не добавлены</div>
        )}
      </div>

      <label
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          border: `2px dashed ${dropZoneActive ? 'var(--accent, #C9A961)' : 'var(--border, #ddd)'}`,
          borderRadius: 10, padding: '24px 16px', marginBottom: 12, cursor: 'pointer',
          background: dropZoneActive ? 'rgba(201,169,97,.07)' : 'transparent', transition: 'all .15s',
        }}
        onDragOver={e => { e.preventDefault(); setDropZoneActive(true) }}
        onDragLeave={() => setDropZoneActive(false)}
        onDrop={handleDropZone}
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted, #888)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        <span style={{ fontSize: 13, color: 'var(--muted, #888)', textAlign: 'center' }}>
          {uploading ? 'Загрузка...' : 'Перетащите фото сюда или нажмите для выбора'}
        </span>
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} disabled={uploading} />
      </label>

      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        <input
          className="input"
          placeholder="https://example.com/photo.jpg"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlAdd() } }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleUrlAdd} disabled={urlLoading || !urlInput.trim()}>
          {urlLoading ? '...' : '+ По URL'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        Порядок в галерее меняется перетаскиванием — как карточки.
      </p>
    </div>
  )
})
