import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function EquipmentNotes({ equipmentId, equipmentName }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ type: 'general', content: '' });
  const [loading, setLoading] = useState(false);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [equipmentId]);

  const loadNotes = () => {
    const data = JSON.parse(localStorage.getItem('ncadbook_demo_data'));
    const equipmentNotes = data.demoEquipmentNotes || [];
    const filtered = equipmentNotes
      .filter(note => note.equipment_id === equipmentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Add creator names
    const notesWithCreators = filtered.map(note => {
      const creator = data.users.find(u => u.id === note.created_by);
      return {
        ...note,
        creator_name: creator ? creator.full_name : 'Unknown'
      };
    });

    setNotes(notesWithCreators);
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      alert('Please enter a note');
      return;
    }

    setLoading(true);

    const data = JSON.parse(localStorage.getItem('ncadbook_demo_data'));
    const noteEntry = {
      id: `en${Date.now()}`,
      equipment_id: equipmentId,
      note_type: newNote.type,
      note: newNote.content,
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    data.demoEquipmentNotes = data.demoEquipmentNotes || [];
    data.demoEquipmentNotes.push(noteEntry);
    localStorage.setItem('ncadbook_demo_data', JSON.stringify(data));

    setNewNote({ type: 'general', content: '' });
    setShowAddModal(false);
    setLoading(false);
    loadNotes();
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
  if (user.role !== 'admin' && user.role !== 'master_admin') {
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
                  onClick={() => setShowAddModal(false)}
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
