import { useState } from 'react'
import { useShortcuts } from '../hooks/useShortcuts'
import { randomPlanet } from '../lib/planets'
import ShortcutItem from './components/ShortcutItem'
import AddShortcutForm from './components/AddShortcutForm'
import './App.css'

export default function App() {
  const { shortcuts, addShortcut, removeShortcut, reorderShortcuts, updateShortcut } = useShortcuts()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [planet] = useState(() => randomPlanet())
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const handleAdd = (shortcut) => {
    addShortcut(shortcut)
    setIsAdding(false)
  }

  const handleEdit = (id) => {
    setEditingId(id)
    setIsAdding(false)
  }

  const handleSave = (data) => {
    updateShortcut(editingId, data)
    setEditingId(null)
  }

  const handleDragStart = (id) => setDraggedId(id)
  const handleDragOver = (id) => setDragOverId(id)
  const handleDrop = (targetId) => {
    if (draggedId && draggedId !== targetId) reorderShortcuts(draggedId, targetId)
    setDraggedId(null)
    setDragOverId(null)
  }
  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const editingShortcut = editingId ? shortcuts.find((s) => s.id === editingId) : null

  return (
    <div className="app">
      <div className="header">
        <span className="header-title">
          {planet && <img src={planet} alt="" className="header-planet" />}
          테코탭
        </span>
        {!isAdding && !editingId && (
          <button
            className="add-btn"
            onClick={() => setIsAdding(true)}
            title="바로가기 추가"
            aria-label="바로가기 추가"
          >
            +
          </button>
        )}
      </div>

      {shortcuts.length > 0 && (
        <div className="shortcuts-grid">
          {shortcuts.map((shortcut) => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              onRemove={removeShortcut}
              onEdit={handleEdit}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedId === shortcut.id}
              isDragOver={dragOverId === shortcut.id && draggedId !== shortcut.id}
              isEditing={editingId === shortcut.id}
            />
          ))}
        </div>
      )}

      {shortcuts.length === 0 && !isAdding && (
        <div className="empty-state">
          {planet && <img src={planet} alt="행성" className="empty-planet" />}
          <p className="empty-title">테코탭에 오신 걸 환영해요</p>
          <p className="empty-sub">우테코 크루의 즐겨찾기를 한 곳에 모아보세요</p>
          <button className="empty-add-btn" onClick={() => setIsAdding(true)}>
            + 바로가기 추가
          </button>
        </div>
      )}

      {isAdding && (
        <>
          {shortcuts.length > 0 && <hr className="divider" />}
          <AddShortcutForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
        </>
      )}

      {editingShortcut && (
        <>
          <hr className="divider" />
          <AddShortcutForm
            initialValues={editingShortcut}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        </>
      )}
    </div>
  )
}
