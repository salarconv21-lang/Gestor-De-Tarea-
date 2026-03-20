// ─── Estado ───────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let currentFilter = 'todas';

// ─── Inicializar ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ─── Agregar tarea ────────────────────────────────────
function addTask() {
  const input = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const text = input.value.trim();

  if (!text) {
    input.focus();
    input.style.outline = '2px solid #ff5c5c';
    setTimeout(() => input.style.outline = '', 800);
    return;
  }

  const task = {
    id: Date.now(),
    text,
    priority,
    estado: 'pendiente',
    fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  tasks.unshift(task);
  save();
  render();

  input.value = '';
  input.focus();
}

// ─── Cambiar estado ───────────────────────────────────
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.estado = task.estado === 'pendiente' ? 'completada' : 'pendiente';
  save();
  render();
}

// ─── Eliminar tarea ───────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ─── Limpiar completadas ──────────────────────────────
function clearCompleted() {
  tasks = tasks.filter(t => t.estado !== 'completada');
  save();
  render();
}

// ─── Filtros ──────────────────────────────────────────
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ─── Guardar ──────────────────────────────────────────
function save() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// ─── Renderizar ───────────────────────────────────────
function render() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');

  const filtered = tasks.filter(t => {
    if (currentFilter === 'todas') return true;
    return t.estado === currentFilter;
  });

  // Stats
  const done = tasks.filter(t => t.estado === 'completada').length;
  const pending = tasks.filter(t => t.estado === 'pendiente').length;
  document.getElementById('stat-done').textContent = `${done} hechas`;
  document.getElementById('stat-pending').textContent = `${pending} pendientes`;

  // Empty state
  if (filtered.length === 0) {
    empty.style.display = 'block';
    // Remove old cards
    document.querySelectorAll('.task-card').forEach(c => c.remove());
    return;
  }

  empty.style.display = 'none';
  document.querySelectorAll('.task-card').forEach(c => c.remove());

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.estado}`;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="task-check" onclick="toggleTask(${task.id})" title="Marcar como ${task.estado === 'completada' ? 'pendiente' : 'completada'}"></div>
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-meta">
          <span class="priority-badge ${task.priority}">${labelPriority(task.priority)}</span>
          <span class="task-date">${task.fecha}</span>
        </div>
      </div>
      <button class="task-delete" onclick="deleteTask(${task.id})" title="Eliminar">✕</button>
    `;

    list.appendChild(card);
  });
}

// ─── Helpers ──────────────────────────────────────────
function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function labelPriority(p) {
  return { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' }[p] || p;
}
