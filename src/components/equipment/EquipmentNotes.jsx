import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentAPI } from '../../utils/api';

export default function EquipmentNotes({ equipmentId, equipmentName }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ type: 'general', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [equipmentId]);

  const loadNotes = async () => {
    try {
      const response = await equipmentAPI.getNotes(equipmentId);
      const notesData = response.notes || [];

      // Map backend response to expected format
      const mappedNotes = notesData.map(note => ({
        id: note.id,
        equipment_id: note.equipment_id || equipmentId,
        note_type: note.note_type,
        note: note.note_content,
        creator_name: note.created_by_name,
        created_by: note.created_by,
        created_at: note.created_at
      }));

      setNotes(mappedNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setNotes([]);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      setError('Please enter a note');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await equipmentAPI.addNote(equipmentId, {
        note_type: newNote.type,
        note_content: newNote.content
      });

      setNewNote({ type: 'general', content: '' });
      setShowAddModal(false);
      await loadNotes();
    } catch (err) {
      setError(err.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      maintenance: '#3b82f6',
      damage: '#ef4444',
      usage: '#10b981',
      general: '#64748b'
    };
    return colors[type] || colors.general;
  };

  const getNoteTypeIcon = (type) => {
    const icons = {
      maintenance: 'M',
      damage: 'D',
      usage: 'U',
      general: 'G'
    };
    return icons[type] || icons.general;
  };

  // Only admins can see notes
  if (!user || (user.role !== 'staff' && user.role !== 'department_admin' && user.role !== 'master_admin')) {
    return null;
  }

  return (
    <div className="equipment-notes-section">
      <div className="notes-header">
        <h3>Equipment Notes</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm"
        >
          + Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-notes">
          <p>No notes for this equipment yet.</p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div
              key={note.id}
              className="note-item"
              style={{ borderLeftColor: getNoteTypeColor(note.note_type) }}
            >
              <div className="note-header">
                <div className="note-type">
                  <span className="note-icon">{getNoteTypeIcon(note.note_type)}</span>
                  <span className="note-type-label">{note.note_type}</span>
                </div>
                <div className="note-meta">
                  <span className="note-creator">{note.creator_name}</span>
                  <span className="note-date">
                    {new Date(note.created_at).toLocaleDateString('en-IE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="note-content">
                {note.note}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Note - {equipmentName}</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="note-type">Note Type</label>
                <select
                  id="note-type"
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                  className="select-input"
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damage">Damage</option>
                  <option value="usage">Usage</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note-content">Note</label>
                <textarea
                  id="note-content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note details..."
                  rows="5"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
