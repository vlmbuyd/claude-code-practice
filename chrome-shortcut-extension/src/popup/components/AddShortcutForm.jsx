import { useState, useRef } from 'react'
import { getFaviconUrl, getDirectFaviconUrl, inferName, normalizeUrl } from '../../lib/favicon'
import { randomPlanet } from '../../lib/planets'

export default function AddShortcutForm({ onAdd, onSave, onCancel, initialValues }) {
  const isEditing = !!initialValues
  const [url, setUrl] = useState(initialValues?.url ?? '')
  const [name, setName] = useState(initialValues?.name ?? '')
  const [customIcon, setCustomIcon] = useState(initialValues?.iconUrl ?? null)
  const [faviconStep, setFaviconStep] = useState(0) // 0: direct, 1: google, 2: letter
  const fileInputRef = useRef(null)

  const normalized = normalizeUrl(url)
  const directFaviconUrl = normalized ? getDirectFaviconUrl(normalized) : null
  const googleFaviconUrl = normalized ? getFaviconUrl(normalized) : null
  const faviconUrl = faviconStep === 0 ? directFaviconUrl : faviconStep === 1 ? googleFaviconUrl : null
  const previewIcon = customIcon || faviconUrl

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setCustomIcon(null)
    setFaviconStep(0)
  }

  const handleFaviconError = () => {
    setFaviconStep((s) => s + 1)
  }

  const handleIconUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCustomIcon(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRandomPlanet = () => setCustomIcon(randomPlanet())

  const handleResetIcon = () => {
    setCustomIcon(null)
    setFaviconStep(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalUrl = normalizeUrl(url)
    if (!finalUrl) return
    try { new URL(finalUrl) } catch { return }

    const data = {
      url: finalUrl,
      name: name.trim() || inferName(finalUrl),
      iconUrl: customIcon || faviconUrl || getDirectFaviconUrl(finalUrl),
    }

    if (isEditing) onSave(data)
    else onAdd(data)
  }

  const namePlaceholder = normalized ? inferName(normalized) || '이름 (선택)' : '이름 (선택)'

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <p className="add-form-title">{isEditing ? '바로가기 수정' : '바로가기 추가'}</p>

      <div className="form-icon-row">
        <div className="form-icon-box">
          {previewIcon ? (
            <img
              src={previewIcon}
              alt="미리보기"
              className="form-icon-preview"
              onError={handleFaviconError}
            />
          ) : (
            <span className="form-icon-placeholder">
              {normalized ? inferName(normalized)[0]?.toUpperCase() || '?' : '?'}
            </span>
          )}
        </div>
        <div className="form-icon-actions">
          <button type="button" className="icon-upload-btn" onClick={() => fileInputRef.current?.click()}>
            아이콘 변경
          </button>
          <button type="button" className="icon-upload-btn" onClick={handleRandomPlanet}>
            🪐 행성 랜덤
          </button>
          {customIcon && (
            <button type="button" className="icon-reset-btn" onClick={handleResetIcon}>
              초기화
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIconUpload} hidden />
        </div>
      </div>

      <div className="form-inputs">
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="URL (예: https://google.com)"
          className="form-input"
          autoFocus
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn-add">
          {isEditing ? '저장' : '추가'}
        </button>
      </div>
    </form>
  )
}
