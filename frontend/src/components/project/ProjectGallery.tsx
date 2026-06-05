import { useState } from 'react'
import type { Photo } from '../../types'

interface Props {
  photos: Photo[]
  projectTitle: string
}

export function ProjectGallery({ photos, projectTitle }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (photos.length === 0) {
    return (
      <div className="ph" style={{ borderRadius: 'var(--r-xl)', height: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
            <rect width="48" height="48" rx="12" fill="var(--gold)" opacity=".15" />
            <path d="M12 36l9-12 6 8 5-6 8 10H12z" fill="var(--gold)" opacity=".4" />
            <circle cx="32" cy="18" r="4" fill="var(--gold)" opacity=".4" />
          </svg>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Фото появятся скоро</span>
        </div>
      </div>
    )
  }

  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent(c => (c + 1) % photos.length)

  return (
    <>
      <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <img
          src={photos[current].url}
          alt={photos[current].caption || projectTitle}
          style={{ width: '100%', height: 480, objectFit: 'cover', cursor: 'zoom-in' }}
          onClick={() => setLightbox(true)}
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(20,17,13,.6)', color: '#fff', border: 'none', borderRadius: '50%',
                width: 44, height: 44, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >‹</button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(20,17,13,.6)', color: '#fff', border: 'none', borderRadius: '50%',
                width: 44, height: 44, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >›</button>
            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(20,17,13,.6)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
              {current + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="row mt-12" style={{ gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {photos.map((p, i) => (
            <img
              key={p.id}
              src={p.url}
              alt={p.caption || ''}
              onClick={() => setCurrent(i)}
              style={{
                width: 80, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                outline: i === current ? '2px solid var(--gold)' : '2px solid transparent',
                outlineOffset: 2, transition: 'outline .15s'
              }}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
          }}
        >
          <img
            src={photos[current].url}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </>
          )}
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
      )}
    </>
  )
}
