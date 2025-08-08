let notes = []
let editingNoteId = null

function loadNotes() {
  const savedNotes = localStorage.getItem('quickNotes')
  return savedNotes ? JSON.parse(savedNotes) : []
}

function saveNote(event) {
  event.preventDefault()

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  if(editingNoteId) {
    // Update existing Note
    const noteIndex = notes.findIndex(note => note.id === editingNoteId)
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: title,
      content: content
    }
  } else {
    // Add New Note with date
    notes.unshift({
      id: generateId(),
      title: title,
      content: content,
      date: Date.now()
    })
  }

  closeNoteDialog()
  saveNotes()
  renderNotes()
}

function generateId() {
  return Date.now().toString()
}

function saveNotes() {
  localStorage.setItem('quickNotes', JSON.stringify(notes))
}

function deleteNote(noteId) {
  notes = notes.filter(note => note.id != noteId)
  saveNotes()
  renderNotes()
}

// Renders notes (default: from notes array)
function renderNotes(noteArray = notes) {
  const notesContainer = document.getElementById('notesContainer');

  if(noteArray.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes found</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  notesContainer.innerHTML = noteArray.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <small>${note.date ? new Date(note.date).toLocaleString() : ''}</small>
      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
          ✏️
        </button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          ❌
        </button>
      </div>
    </div>
  `).join('')
}

// Search notes
function searchNotes() {
  const query = document.getElementById('searchInput').value.toLowerCase()
  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  )
  renderNotes(filtered)
}

// Filter notes by date
function filterNotes() {
  const filterValue = document.getElementById('filterSelect').value
  let sorted = [...notes]

  if (filterValue === 'newest') {
    sorted.sort((a, b) => (b.date || 0) - (a.date || 0))
  } else if (filterValue === 'oldest') {
    sorted.sort((a, b) => (a.date || 0) - (b.date || 0))
  }

  renderNotes(sorted)
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if(noteId) {
    const noteToEdit = notes.find(note => note.id === noteId)
    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'
    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
  }
  else {
    editingNoteId = null
    document.getElementById('dialogTitle').textContent = 'Add New Note'
    titleInput.value = ''
    contentInput.value = ''
  }

  dialog.showModal()
  titleInput.focus()
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close()
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}

function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}

document.addEventListener('DOMContentLoaded', function() {
  applyStoredTheme()
  notes = loadNotes()
  renderNotes()

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

  document.getElementById('noteDialog').addEventListener('click', function(event) {
    if(event.target === this) {
      closeNoteDialog()
    }
  })

  // Search as you type
  document.getElementById('searchInput').addEventListener('input', searchNotes)

  // Filter on change
  document.getElementById('filterSelect').addEventListener('change', filterNotes)
})
