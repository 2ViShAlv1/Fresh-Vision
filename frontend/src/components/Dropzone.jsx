import { useCallback, useRef, useState } from 'react'
import { formatBytes, validateFile } from '../lib/format'

export default function Dropzone({ onFile, disabled, file, previewUrl, onClear }) {
  const inputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState(null)

  const accept = useCallback(
    (candidate) => {
      const error = validateFile(candidate)
      if (error) {
        setLocalError(error)
        return
      }
      setLocalError(null)
      onFile(candidate)
    },
    [onFile],
  )

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) accept(dropped)
  }

  const onPaste = (event) => {
    const item = [...(event.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))
    if (item) accept(item.getAsFile())
  }

  return (
    <div className="dropzone-wrap">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${previewUrl ? 'has-preview' : ''} ${disabled ? 'is-disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => !disabled && !previewUrl && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !previewUrl) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload an image of a fruit or vegetable"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          hidden
          onChange={(e) => {
            const picked = e.target.files?.[0]
            if (picked) accept(picked)
            e.target.value = ''
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const picked = e.target.files?.[0]
            if (picked) accept(picked)
            e.target.value = ''
          }}
        />

        {previewUrl ? (
          <figure className="dropzone__preview">
            <img src={previewUrl} alt={file?.name || 'Uploaded produce'} />
            <figcaption>
              <span className="truncate">{file?.name || 'Selected image'}</span>
              {file?.size ? <em>{formatBytes(file.size)}</em> : null}
            </figcaption>
          </figure>
        ) : (
          <div className="dropzone__empty">
            <span className="dropzone__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3" />
                <path d="M12 16V3M7.5 7.5 12 3l4.5 4.5" />
              </svg>
            </span>
            <h3>Drop an image here</h3>
            <p>or click to browse · paste from clipboard</p>
            <button
              type="button"
              className="btn btn--tiny dropzone__camera-btn"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                cameraInputRef.current?.click()
              }}
            >
              📷 Take a photo
            </button>
            <span className="dropzone__hint">JPG · PNG · WEBP · up to 10 MB</span>
          </div>
        )}
      </div>

      {previewUrl ? (
        <div className="dropzone__actions">
          <button className="btn btn--tiny" onClick={() => inputRef.current?.click()} disabled={disabled}>
            Replace image
          </button>
          <button className="btn btn--tiny" onClick={() => cameraInputRef.current?.click()} disabled={disabled}>
            📷 Retake
          </button>
          <button className="btn btn--tiny btn--danger" onClick={onClear} disabled={disabled}>
            Clear
          </button>
        </div>
      ) : null}

      {localError ? <p className="field-error">{localError}</p> : null}
    </div>
  )
}
