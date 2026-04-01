import { useState } from 'react'
import { getFaviconUrl } from '../../lib/favicon'

function openUrl(url) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
}

export default function ShortcutItem({
  shortcut,
  onRemove,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  isEditing,
}) {
  const [iconStep, setIconStep] = useState(0) // 0: stored, 1: google, 2: letter
  const letter = (shortcut.name || '?')[0].toUpperCase()
  const isCustomIcon = shortcut.iconUrl?.startsWith('data:')

  const currentIconSrc =
    iconStep === 0 ? shortcut.iconUrl :
    iconStep === 1 ? getFaviconUrl(shortcut.url) :
    null

  const handleIconError = () => {
    if (!isCustomIcon) setIconStep((s) => s + 1)
    else setIconStep(2)
  }

  const classNames = [
    'shortcut-item',
    isDragging ? 'is-dragging' : '',
    isDragOver ? 'is-drag-over' : '',
    isEditing ? 'is-editing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(shortcut.id)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(shortcut.id)
      }}
      onDrop={() => onDrop(shortcut.id)}
      onDragEnd={onDragEnd}
    >
      <button
        className="shortcut-btn"
        onClick={() => openUrl(shortcut.url)}
        title={shortcut.url}
      >
        {currentIconSrc && iconStep < 2 ? (
          <img
            src={currentIconSrc}
            alt={shortcut.name}
            className="shortcut-icon"
            onError={handleIconError}
          />
        ) : (
          <div className="shortcut-icon-fallback">{letter}</div>
        )}
        <span className="shortcut-name">{shortcut.name}</span>
      </button>
      <button
        className="edit-btn"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(shortcut.id)
        }}
        title="수정"
        aria-label={`${shortcut.name} 수정`}
      >
        ✎
      </button>
      <button
        className="delete-btn"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(shortcut.id)
        }}
        title="삭제"
        aria-label={`${shortcut.name} 삭제`}
      >
        ×
      </button>
    </div>
  )
}
