/**
 * ============================================================================
 * StudyFlow - Student Task & Productivity OS
 * Pure Vanilla JavaScript (ES6+)
 * InternNova Week 6 Final Web Development Project
 * ============================================================================
 * Features:
 *  - Full Task CRUD (Add, Edit, Delete, Quick Complete / Toggle)
 *  - Filtering (Status, Priority, Category/Course)
 *  - Dynamic Real-time Search & Multi-criteria Sorting
 *  - LocalStorage Persistence with JSON Export/Import & Demo Reset
 *  - Dynamic Productivity Gauge (SVG Circular Ring & Workload Distribution)
 *  - Interactive Pomodoro Focus Timer with Web Audio API Bell Chimes
 *  - Responsive Collapsible Sidebar & Mobile Navigation
 *  - Dark / Light Mode Theming with Instant Preference Saving
 *  - Toast Notification System
 *  - Form Validation with Inline Error States
 *  - Keyboard Shortcuts (N, /, D, Space, Esc)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Constants & Storage Keys
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    TASKS: 'studyflow_tasks_v1',
    THEME: 'studyflow_theme_v1',
    POMO_STATS: 'studyflow_pomodoro_stats_v1',
    VIEW_MODE: 'studyflow_view_mode_v1'
  };

  const DEFAULT_CATEGORIES = [
    'Computer Science',
    'Web Development',
    'Mathematics',
    'Physics',
    'Exam Prep',
    'Extracurricular',
    'Personal'
  ];

  const CATEGORY_COLORS = {
    'Computer Science': '#6366f1',
    'Web Development': '#06b6d4',
    'Mathematics': '#3b82f6',
    'Physics': '#8b5cf6',
    'Exam Prep': '#ec4899',
    'Extracurricular': '#10b981',
    'Personal': '#f59e0b'
  };

  const PRIORITY_WEIGHTS = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const TIMER_PRESETS = {
    work: 25 * 60,       // 25 minutes
    shortBreak: 5 * 60,  // 5 minutes
    longBreak: 15 * 60   // 15 minutes
  };

  // Helper: Generates a realistic date relative to today
  function getRelativeDateString(daysOffset, hoursOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Sample Demonstration Student Tasks
  const SAMPLE_TASKS = [
    {
      id: 'task-sample-1',
      title: 'InternNova Week 6 Final Web Dev Project Submission',
      category: 'Web Development',
      priority: 'urgent',
      status: 'in-progress',
      dueDate: getRelativeDateString(0, 4), // Due today
      pomodoros: 4,
      description: 'Build complete responsive Student Task & Productivity SaaS with Vanilla HTML/CSS/JS, full CRUD, Pomodoro timer, and GitHub Pages deployment.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task-sample-2',
      title: 'Data Structures Problem Set: Balanced BSTs',
      category: 'Computer Science',
      priority: 'high',
      status: 'pending',
      dueDate: getRelativeDateString(1, 18), // Due tomorrow
      pomodoros: 3,
      description: 'Implement node rotation algorithms (AVL trees) and solve runtime complexity analysis questions in module 4.',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'task-sample-3',
      title: 'Calculus III Midterm Exam Review & Formula Sheet',
      category: 'Mathematics',
      priority: 'high',
      status: 'pending',
      dueDate: getRelativeDateString(3, 10), // In 3 days
      pomodoros: 3,
      description: 'Practice triple integrals, vector fields, Green’s Theorem problems, and prepare one-page reference summary.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'task-sample-4',
      title: 'Electromagnetic Induction Physics Lab Analysis',
      category: 'Physics',
      priority: 'medium',
      status: 'pending',
      dueDate: getRelativeDateString(5, 14), // In 5 days
      pomodoros: 2,
      description: 'Compute magnetic flux rates from oscilloscope sensor exports and plot error margin graphs in Python or Excel.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'task-sample-5',
      title: 'Prepare Presentation Slides for AI Seminar',
      category: 'Extracurricular',
      priority: 'medium',
      status: 'in-progress',
      dueDate: getRelativeDateString(6, 16), // In 6 days
      pomodoros: 2,
      description: 'Draft 15-minute presentation slides highlighting foundational concepts of neural networks and large language models.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'task-sample-6',
      title: 'Submit Bi-weekly Student Internship Reflection Log',
      category: 'Personal',
      priority: 'low',
      status: 'completed',
      dueDate: getRelativeDateString(-1, 23), // Yesterday (completed)
      pomodoros: 1,
      description: 'Document web development learnings, DOM manipulation techniques, and personal productivity goals for the upcoming semester.',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ];

  // --------------------------------------------------------------------------
  // 2. Application State
  // --------------------------------------------------------------------------
  const state = {
    tasks: [],
    filterStatus: 'all',      // 'all' | 'pending' | 'in-progress' | 'completed'
    filterPriority: 'all',    // 'all' | 'urgent' | 'high' | 'medium' | 'low'
    filterCategory: 'all',    // 'all' | string
    searchQuery: '',
    sortBy: 'due-asc',        // 'due-asc' | 'due-desc' | 'priority-desc' | 'title-asc' | 'created-desc'
    viewMode: 'grid',         // 'grid' | 'list'
    theme: 'light',
    
    // Pomodoro Timer State
    timer: {
      mode: 'work',
      remainingSeconds: TIMER_PRESETS.work,
      isRunning: false,
      intervalId: null,
      linkedTaskId: '',
      sessionsToday: 0,
      minutesToday: 0
    },

    // Modals
    editingTaskId: null,
    deletingTaskId: null
  };

  // --------------------------------------------------------------------------
  // 3. Audio Chime (Web Audio API Synthesizer - 100% Offline & Pure JS)
  // --------------------------------------------------------------------------
  function playChimeSound(frequency = 587.33, duration = 0.4) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay may be muted by browser policy before first interaction
    }
  }

  // --------------------------------------------------------------------------
  // 4. Utility Functions
  // --------------------------------------------------------------------------
  function generateId() {
    return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDateTime(isoString) {
    if (!isoString) return 'No due date';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';

    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return d.toLocaleDateString(undefined, options);
  }

  function getDueUrgencyInfo(dueDateStr, status) {
    if (status === 'completed') {
      return { label: 'Completed', class: 'completed' };
    }
    if (!dueDateStr) {
      return { label: 'No Deadline', class: 'upcoming' };
    }

    const now = new Date();
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      const overdueHours = Math.abs(diffHours);
      if (overdueDays === 0) {
        return { label: `Overdue by ${overdueHours}h`, class: 'overdue' };
      }
      return { label: `Overdue by ${overdueDays}d`, class: 'overdue' };
    }

    if (diffHours <= 24) {
      return { label: `Due Today (${diffHours}h left)`, class: 'today' };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow', class: 'today' };
    }
    return { label: `Due in ${diffDays} days`, class: 'upcoming' };
  }

  // --------------------------------------------------------------------------
  // 5. LocalStorage Manager
  // --------------------------------------------------------------------------
  const Storage = {
    loadTasks() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Could not read tasks from LocalStorage, loading defaults.', err);
      }
      // If no valid stored tasks, return pre-populated demo tasks
      return [...SAMPLE_TASKS];
    },

    saveTasks(tasks) {
      try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      } catch (err) {
        console.error('Failed to save tasks to LocalStorage', err);
      }
    },

    loadTheme() {
      try {
        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (storedTheme) return storedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (e) {}
      return 'light';
    },

    saveTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch (e) {}
    },

    loadViewMode() {
      try {
        return localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'grid';
      } catch (e) {
        return 'grid';
      }
    },

    saveViewMode(mode) {
      try {
        localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
      } catch (e) {}
    },

    loadTimerStats() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.POMO_STATS);
        if (stored) {
          const parsed = JSON.parse(stored);
          const today = new Date().toDateString();
          if (parsed.date === today) {
            return {
              sessionsToday: parsed.sessionsToday || 0,
              minutesToday: parsed.minutesToday || 0
            };
          }
        }
      } catch (e) {}
      return { sessionsToday: 0, minutesToday: 0 };
    },

    saveTimerStats(sessions, minutes) {
      try {
        const payload = {
          date: new Date().toDateString(),
          sessionsToday: sessions,
          minutesToday: minutes
        };
        localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(payload));
      } catch (e) {}
    }
  };

  // --------------------------------------------------------------------------
  // 6. Toast Notification Manager
  // --------------------------------------------------------------------------
  const Toast = {
    container: document.getElementById('toast-container'),

    show(title, message, type = 'success') {
      if (!this.container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');

      let icon = '✅';
      if (type === 'warning') icon = '⚠️';
      if (type === 'danger') icon = '❌';
      if (type === 'info') icon = 'ℹ️';

      toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
          <h4 class="toast-title">${escapeHTML(title)}</h4>
          <p class="toast-message">${escapeHTML(message)}</p>
        </div>
        <button type="button" class="toast-close-btn" aria-label="Close notification">&times;</button>
        <div class="toast-progress-bar"></div>
      `;

      const closeBtn = toast.querySelector('.toast-close-btn');
      const dismiss = () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 250);
      };

      closeBtn.addEventListener('click', dismiss);

      // Auto dismiss after 3.5s
      const timer = setTimeout(dismiss, 3500);
      toast.addEventListener('mouseenter', () => clearTimeout(timer));

      this.container.appendChild(toast);
    }
  };

  // --------------------------------------------------------------------------
  // 7. Live Digital Clock & Quotes
  // --------------------------------------------------------------------------
  function initLiveClock() {
    const clockEl = document.getElementById('live-datetime');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      clockEl.textContent = now.toLocaleDateString(undefined, options);
    }
    update();
    setInterval(update, 1000);
  }

  function initInspirationalQuotes() {
    const quoteEl = document.getElementById('daily-quote');
    if (!quoteEl) return;

    const quotes = [
      '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
      '"Focus on progress, not perfection. Every completed assignment moves you forward."',
      '"The secret of getting ahead is getting started. Break your tasks into manageable bites." — Mark Twain',
      '"Discipline is choosing between what you want now and what you want most." — Abraham Lincoln',
      '"Deep work is the superpower of the 21st century. Eliminate distractions and flow."'
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = randomQuote;
  }

  // --------------------------------------------------------------------------
  // 8. Theme Manager (Dark / Light Mode)
  // --------------------------------------------------------------------------
  const ThemeManager = {
    init() {
      state.theme = Storage.loadTheme();
      this.applyTheme(state.theme);

      const toggleBtn = document.getElementById('theme-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          this.setTheme(next);
        });
      }
    },

    setTheme(newTheme) {
      state.theme = newTheme;
      Storage.saveTheme(newTheme);
      this.applyTheme(newTheme);
      Toast.show('Theme Updated', `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      const label = document.getElementById('theme-mode-text');
      if (label) {
        label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      }
    }
  };

  // --------------------------------------------------------------------------
  // 9. Task Management (CRUD Operations)
  // --------------------------------------------------------------------------
  const TaskManager = {
    init() {
      state.tasks = Storage.loadTasks();
      state.viewMode = Storage.loadViewMode();
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      // Create new task button
      const openModalBtn = document.getElementById('open-task-modal-btn');
      const sectionAddBtn = document.getElementById('section-add-task-btn');
      const heroCreateBtn = document.getElementById('hero-create-btn');
      const emptyStateBtn = document.getElementById('empty-state-btn');

      [openModalBtn, sectionAddBtn, heroCreateBtn, emptyStateBtn].forEach((btn) => {
        if (btn) {
          btn.addEventListener('click', () => ModalManager.openTaskModal());
        }
      });

      // Task Form submission
      const form = document.getElementById('task-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
      }

      // Pomodoro slider helper update
      const pomoSlider = document.getElementById('task-pomodoros');
      const pomoDisplay = document.getElementById('pomo-count-display');
      const pomoHelper = document.getElementById('pomodoro-hours-helper');
      if (pomoSlider && pomoDisplay) {
        pomoSlider.addEventListener('input', () => {
          const val = parseInt(pomoSlider.value, 10);
          const mins = val * 25;
          const hrs = (mins / 60).toFixed(1);
          pomoDisplay.textContent = `${val} 🍅 (${mins} mins)`;
          if (pomoHelper) {
            pomoHelper.textContent = `(~${hrs} hrs)`;
          }
        });
      }

      // Character counter for description
      const descInput = document.getElementById('task-description');
      const charCounter = document.getElementById('char-counter');
      if (descInput && charCounter) {
        descInput.addEventListener('input', () => {
          charCounter.textContent = `${descInput.value.length} / 400`;
        });
      }

      // Status filter tabs
      const statusTabs = document.querySelectorAll('.status-tab');
      statusTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          statusTabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          state.filterStatus = tab.dataset.status;
          this.render();
        });
      });

      // Priority filter dropdown
      const prioritySelect = document.getElementById('filter-priority');
      if (prioritySelect) {
        prioritySelect.addEventListener('change', (e) => {
          state.filterPriority = e.target.value;
          this.render();
        });
      }

      // Category filter dropdown
      const categorySelect = document.getElementById('filter-category');
      if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
          state.filterCategory = e.target.value;
          this.render();
        });
      }

      // Sorting dropdown
      const sortSelect = document.getElementById('sort-tasks');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          state.sortBy = e.target.value;
          this.render();
        });
      }

      // Global Search input
      const searchInput = document.getElementById('global-search-input');
      const clearSearchBtn = document.getElementById('search-clear-btn');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          state.searchQuery = e.target.value.trim().toLowerCase();
          if (clearSearchBtn) {
            clearSearchBtn.hidden = state.searchQuery === '';
          }
          this.render();
        });
      }
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          if (searchInput) {
            searchInput.value = '';
            state.searchQuery = '';
            clearSearchBtn.hidden = true;
            this.render();
          }
        });
      }

      // View switcher (Grid vs List)
      const viewGridBtn = document.getElementById('view-grid-btn');
      const viewListBtn = document.getElementById('view-list-btn');
      if (viewGridBtn && viewListBtn) {
        viewGridBtn.addEventListener('click', () => this.setViewMode('grid'));
        viewListBtn.addEventListener('click', () => this.setViewMode('list'));
      }

      // Clear completed tasks button
      const clearCompletedBtn = document.getElementById('clear-completed-btn');
      if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
      }

      // Clear all active filters link
      const clearFiltersBtn = document.getElementById('btn-clear-all-filters');
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => this.resetFilters());
      }

      // Tasks Container Event Delegation for Dynamic Action Buttons
      const tasksContainer = document.getElementById('tasks-container');
      if (tasksContainer) {
        tasksContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.task-card');
          if (!card) return;
          const taskId = card.dataset.id;

          // Toggle Complete Checkbox
          if (e.target.matches('.task-checkbox-input')) {
            this.toggleComplete(taskId);
            return;
          }

          // Edit Task Button
          if (e.target.closest('.edit-act')) {
            ModalManager.openTaskModal(taskId);
            return;
          }

          // Delete Task Button
          if (e.target.closest('.delete-act')) {
            ModalManager.openDeleteModal(taskId);
            return;
          }

          // Pomodoro Focus Action
          if (e.target.closest('.focus-act')) {
            PomodoroManager.linkTaskAndScroll(taskId);
            return;
          }
        });

        // Quick Status Dropdown change
        tasksContainer.addEventListener('change', (e) => {
          if (e.target.matches('.status-dropdown-select')) {
            const card = e.target.closest('.task-card');
            if (card) {
              const taskId = card.dataset.id;
              this.updateTaskStatus(taskId, e.target.value);
            }
          }
        });
      }
    },

    setViewMode(mode) {
      state.viewMode = mode;
      Storage.saveViewMode(mode);

      const viewGridBtn = document.getElementById('view-grid-btn');
      const viewListBtn = document.getElementById('view-list-btn');
      const tasksContainer = document.getElementById('tasks-container');

      if (viewGridBtn && viewListBtn && tasksContainer) {
        if (mode === 'grid') {
          viewGridBtn.classList.add('active');
          viewListBtn.classList.remove('active');
          tasksContainer.className = 'tasks-container grid-view';
        } else {
          viewGridBtn.classList.remove('active');
          viewListBtn.classList.add('active');
          tasksContainer.className = 'tasks-container list-view';
        }
      }
    },

    resetFilters() {
      state.filterStatus = 'all';
      state.filterPriority = 'all';
      state.filterCategory = 'all';
      state.searchQuery = '';

      // Reset DOM controls
      document.querySelectorAll('.status-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.status === 'all');
      });

      const prioritySelect = document.getElementById('filter-priority');
      if (prioritySelect) prioritySelect.value = 'all';

      const categorySelect = document.getElementById('filter-category');
      if (categorySelect) categorySelect.value = 'all';

      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.value = '';

      const clearSearchBtn = document.getElementById('search-clear-btn');
      if (clearSearchBtn) clearSearchBtn.hidden = true;

      this.render();
      Toast.show('Filters Reset', 'Showing all course assignments', 'info');
    },

    handleFormSubmit(e) {
      e.preventDefault();

      // Form Elements
      const idField = document.getElementById('task-id-field');
      const titleInput = document.getElementById('task-title');
      const categorySelect = document.getElementById('task-category');
      const prioritySelect = document.getElementById('task-priority');
      const statusSelect = document.getElementById('task-status');
      const dueDateInput = document.getElementById('task-due-date');
      const pomoRange = document.getElementById('task-pomodoros');
      const descInput = document.getElementById('task-description');

      // Validation
      let isValid = true;
      const titleVal = titleInput.value.trim();
      const titleErr = document.getElementById('task-title-error');
      const dueErr = document.getElementById('task-due-date-error');

      if (titleVal.length < 3) {
        titleInput.classList.add('is-invalid');
        if (titleErr) titleErr.textContent = 'Title must be at least 3 characters long.';
        isValid = false;
      } else {
        titleInput.classList.remove('is-invalid');
        if (titleErr) titleErr.textContent = '';
      }

      if (!dueDateInput.value) {
        dueDateInput.classList.add('is-invalid');
        if (dueErr) dueErr.textContent = 'Please choose a due date & time.';
        isValid = false;
      } else {
        dueDateInput.classList.remove('is-invalid');
        if (dueErr) dueErr.textContent = '';
      }

      if (!isValid) return;

      const taskData = {
        title: titleVal,
        category: categorySelect.value,
        priority: prioritySelect.value,
        status: statusSelect.value,
        dueDate: dueDateInput.value,
        pomodoros: parseInt(pomoRange.value, 10) || 1,
        description: descInput.value.trim()
      };

      if (idField.value) {
        // Update existing task
        this.updateTask(idField.value, taskData);
      } else {
        // Create new task
        this.createTask(taskData);
      }

      ModalManager.closeAllModals();
    },

    createTask(data) {
      const newTask = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString()
      };

      state.tasks.unshift(newTask);
      Storage.saveTasks(state.tasks);
      this.render();
      playChimeSound(659.25, 0.3); // High E note
      Toast.show('Task Created! 📝', `"${newTask.title}" added to your study schedule.`, 'success');
    },

    updateTask(id, data) {
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index === -1) return;

      state.tasks[index] = {
        ...state.tasks[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      Storage.saveTasks(state.tasks);
      this.render();
      Toast.show('Task Updated! ✏️', `"${state.tasks[index].title}" has been saved.`, 'info');
    },

    updateTaskStatus(id, newStatus) {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;

      task.status = newStatus;
      Storage.saveTasks(state.tasks);
      this.render();

      if (newStatus === 'completed') {
        playChimeSound(880, 0.4); // A note celebration
        Toast.show('Awesome job! 🎉', `Completed: "${task.title}"`, 'success');
      } else {
        Toast.show('Status Changed', `"${task.title}" is now ${newStatus}.`, 'info');
      }
    },

    toggleComplete(id) {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;

      task.status = task.status === 'completed' ? 'pending' : 'completed';
      Storage.saveTasks(state.tasks);
      this.render();

      if (task.status === 'completed') {
        playChimeSound(880, 0.4);
        Toast.show('Task Completed! 🎉', `Great work finishing "${task.title}"!`, 'success');
      } else {
        Toast.show('Reopened Task', `"${task.title}" marked as pending.`, 'info');
      }
    },

    deleteTask(id) {
      const taskToDelete = state.tasks.find((t) => t.id === id);
      const title = taskToDelete ? taskToDelete.title : 'Task';

      state.tasks = state.tasks.filter((t) => t.id !== id);
      Storage.saveTasks(state.tasks);
      this.render();

      Toast.show('Task Deleted', `"${title}" has been permanently removed.`, 'danger');
    },

    clearCompleted() {
      const completedCount = state.tasks.filter((t) => t.status === 'completed').length;
      if (completedCount === 0) {
        Toast.show('No Completed Tasks', 'There are no completed tasks to clear.', 'info');
        return;
      }

      state.tasks = state.tasks.filter((t) => t.status !== 'completed');
      Storage.saveTasks(state.tasks);
      this.render();
      Toast.show('Cleared Completed', `Removed ${completedCount} finished tasks.`, 'warning');
    },

    // ------------------------------------------------------------------------
    // Filtering, Sorting, and Data Processing
    // ------------------------------------------------------------------------
    getFilteredTasks() {
      let filtered = [...state.tasks];

      // 1. Status Filter
      if (state.filterStatus !== 'all') {
        filtered = filtered.filter((t) => t.status === state.filterStatus);
      }

      // 2. Priority Filter
      if (state.filterPriority !== 'all') {
        filtered = filtered.filter((t) => t.priority === state.filterPriority);
      }

      // 3. Category Filter
      if (state.filterCategory !== 'all') {
        filtered = filtered.filter((t) => t.category === state.filterCategory);
      }

      // 4. Search Query (Title, Description, Category)
      if (state.searchQuery) {
        filtered = filtered.filter((t) => {
          const tTitle = (t.title || '').toLowerCase();
          const tDesc = (t.description || '').toLowerCase();
          const tCat = (t.category || '').toLowerCase();
          return (
            tTitle.includes(state.searchQuery) ||
            tDesc.includes(state.searchQuery) ||
            tCat.includes(state.searchQuery)
          );
        });
      }

      // 5. Sorting
      filtered.sort((a, b) => {
        switch (state.sortBy) {
          case 'due-asc': {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
          }
          case 'due-desc': {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
            return dateB - dateA;
          }
          case 'priority-desc': {
            const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
            const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
            return weightB - weightA;
          }
          case 'title-asc': {
            return (a.title || '').localeCompare(b.title || '');
          }
          case 'created-desc':
          default: {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          }
        }
      });

      return filtered;
    },

    // ------------------------------------------------------------------------
    // UI Rendering
    // ------------------------------------------------------------------------
    render() {
      const filteredTasks = this.getFilteredTasks();
      const container = document.getElementById('tasks-container');
      const emptyState = document.getElementById('empty-state');
      const counterBadge = document.getElementById('tasks-counter-badge');
      const navCounter = document.getElementById('nav-task-count');

      // Update counters
      const totalCount = state.tasks.length;
      const filteredCount = filteredTasks.length;
      if (counterBadge) {
        counterBadge.textContent = `${filteredCount} of ${totalCount} Tasks`;
      }
      if (navCounter) {
        navCounter.textContent = totalCount;
      }

      // Render Active Filter Chips Bar
      this.renderActiveFilterChips();

      // Empty State visibility
      if (filteredTasks.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyState) {
          emptyState.hidden = false;
          const emptyTitle = document.getElementById('empty-state-title');
          const emptyDesc = document.getElementById('empty-state-desc');
          if (state.searchQuery || state.filterStatus !== 'all' || state.filterPriority !== 'all' || state.filterCategory !== 'all') {
            if (emptyTitle) emptyTitle.textContent = 'No matching assignments found';
            if (emptyDesc) emptyDesc.textContent = 'Try adjusting or clearing your search filters to see other tasks.';
          } else {
            if (emptyTitle) emptyTitle.textContent = 'Your schedule is clear! 🌟';
            if (emptyDesc) emptyDesc.textContent = 'All assignments are done! Click below to create your next study task.';
          }
        }
      } else {
        if (emptyState) emptyState.hidden = true;
        if (container) {
          container.innerHTML = filteredTasks.map((t) => this.renderTaskCardHTML(t)).join('');
        }
      }

      // Update KPI Statistics & Progress Charts
      this.updateStatistics();
      this.populateCategoryFilters();
      PomodoroManager.populateTaskDropdown();
    },

    renderActiveFilterChips() {
      const bar = document.getElementById('active-filters-bar');
      const tagsWrap = document.getElementById('active-filters-tags');
      if (!bar || !tagsWrap) return;

      const chips = [];

      if (state.filterStatus !== 'all') {
        chips.push(`Status: <strong>${state.filterStatus}</strong>`);
      }
      if (state.filterPriority !== 'all') {
        chips.push(`Priority: <strong>${state.filterPriority}</strong>`);
      }
      if (state.filterCategory !== 'all') {
        chips.push(`Course: <strong>${state.filterCategory}</strong>`);
      }
      if (state.searchQuery) {
        chips.push(`Search: <strong>"${state.searchQuery}"</strong>`);
      }

      if (chips.length > 0) {
        bar.hidden = false;
        tagsWrap.innerHTML = chips
          .map((chip) => `<span class="active-filter-tag">${chip}</span>`)
          .join('');
      } else {
        bar.hidden = true;
        tagsWrap.innerHTML = '';
      }
    },

    renderTaskCardHTML(task) {
      const isCompleted = task.status === 'completed';
      const urgency = getDueUrgencyInfo(task.dueDate, task.status);
      const catColor = CATEGORY_COLORS[task.category] || '#6366f1';
      const formattedDue = formatDateTime(task.dueDate);

      // Pomodoro tomato symbols
      const pomoCount = task.pomodoros || 1;
      const tomatoes = '🍅'.repeat(Math.min(pomoCount, 5));

      return `
        <article class="task-card ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
          
          <div class="task-card-header">
            <span class="task-category-badge" style="border-left: 3px solid ${catColor};">
              ${escapeHTML(task.category)}
            </span>
            <div class="task-meta-badges">
              <span class="badge-priority ${task.priority}">${task.priority}</span>
              <span class="badge-urgency ${urgency.class}">${urgency.label}</span>
            </div>
          </div>

          <div class="task-card-main">
            <label class="custom-checkbox" title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}">
              <input type="checkbox" class="task-checkbox-input" ${isCompleted ? 'checked' : ''}>
              <span class="checkmark"></span>
            </label>
            <h3 class="task-title" title="${escapeHTML(task.title)}">${escapeHTML(task.title)}</h3>
          </div>

          ${
            task.description
              ? `<p class="task-description">${escapeHTML(task.description)}</p>`
              : ''
          }

          <div class="task-info-bar">
            <div class="info-item" title="Deadline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${formattedDue}</span>
            </div>

            <div class="info-item" title="Estimated Focus Sessions">
              <span class="pomo-tomatoes">${tomatoes}</span>
              <span>(${pomoCount * 25}m)</span>
            </div>
          </div>

          <div class="task-card-footer">
            <select class="status-dropdown-select" title="Change status">
              <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>

            <div class="card-actions-right">
              <button type="button" class="btn-card-action focus-act" title="Focus on this task in Pomodoro">
                ⏱️
              </button>
              <button type="button" class="btn-card-action edit-act" title="Edit assignment" aria-label="Edit task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn-card-action delete-act" title="Delete assignment" aria-label="Delete task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

        </article>
      `;
    },

    // ------------------------------------------------------------------------
    // Dynamic KPI & Productivity Score Updates
    // ------------------------------------------------------------------------
    updateStatistics() {
      const total = state.tasks.length;
      const completed = state.tasks.filter((t) => t.status === 'completed').length;
      const inProgress = state.tasks.filter((t) => t.status === 'in-progress').length;
      const pending = state.tasks.filter((t) => t.status === 'pending').length;

      // Count Overdue & Urgent
      const now = new Date();
      const overdueTasks = state.tasks.filter((t) => {
        if (t.status === 'completed' || !t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due.getTime() < now.getTime() || t.priority === 'urgent';
      });

      // Update Top KPI Counters
      const statTotal = document.getElementById('stat-total-tasks');
      const statProgress = document.getElementById('stat-progress-tasks');
      const statCompleted = document.getElementById('stat-completed-tasks');
      const statOverdue = document.getElementById('stat-overdue-tasks');
      const statCompletionRate = document.getElementById('stat-completion-rate');

      if (statTotal) statTotal.textContent = total;
      if (statProgress) statProgress.textContent = inProgress;
      if (statCompleted) statCompleted.textContent = completed;
      if (statOverdue) statOverdue.textContent = overdueTasks.length;

      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      if (statCompletionRate) {
        statCompletionRate.textContent = `${completionPercentage}% Done`;
      }

      // Update Circular SVG Productivity Gauge
      const ringFill = document.getElementById('productivity-ring-fill');
      const percentEl = document.getElementById('productivity-percentage');
      const rankBadge = document.getElementById('productivity-rank-badge');

      if (percentEl) percentEl.textContent = `${completionPercentage}%`;

      if (ringFill) {
        // Circumference of r=72 is 2 * Math.PI * 72 = 452.39
        const circumference = 452.39;
        const offset = circumference - (completionPercentage / 100) * circumference;
        ringFill.style.strokeDashoffset = offset;

        // Change ring color based on tier
        if (completionPercentage >= 75) {
          ringFill.style.stroke = '#10b981'; // Green
        } else if (completionPercentage >= 40) {
          ringFill.style.stroke = '#4f46e5'; // Indigo
        } else {
          ringFill.style.stroke = '#f59e0b'; // Amber
        }
      }

      if (rankBadge) {
        if (completionPercentage >= 80) {
          rankBadge.textContent = '🌟 Master Scholar';
        } else if (completionPercentage >= 50) {
          rankBadge.textContent = '⚡ High Momentum';
        } else if (completionPercentage > 0) {
          rankBadge.textContent = '🌱 Building Pace';
        } else {
          rankBadge.textContent = '⏳ Ready to Start';
        }
      }

      // Update Analytics details
      const detailFinished = document.getElementById('analytics-finished-count');
      const detailPending = document.getElementById('analytics-pending-count');
      const detailFocus = document.getElementById('analytics-focus-count');

      if (detailFinished) detailFinished.textContent = `${completed} Tasks`;
      if (detailPending) detailPending.textContent = `${pending + inProgress} Remaining`;
      if (detailFocus) detailFocus.textContent = `${state.timer.sessionsToday} Sessions`;

      // Update Workload Distribution by Course
      this.renderCategoryDistribution();

      // Update Priority Distribution
      this.renderPriorityDistribution();
    },

    renderCategoryDistribution() {
      const container = document.getElementById('category-bars-container');
      if (!container) return;

      const categoryCounts = {};
      DEFAULT_CATEGORIES.forEach((cat) => (categoryCounts[cat] = 0));

      state.tasks.forEach((t) => {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      });

      const total = state.tasks.length || 1;
      const sortedCategories = Object.entries(categoryCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

      if (sortedCategories.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted)">No active assignments.</p>`;
        return;
      }

      container.innerHTML = sortedCategories
        .map(([cat, count]) => {
          const pct = Math.round((count / total) * 100);
          const color = CATEGORY_COLORS[cat] || '#6366f1';
          return `
            <div class="category-bar-item">
              <div class="category-bar-header">
                <span><strong>${escapeHTML(cat)}</strong></span>
                <span>${count} task${count > 1 ? 's' : ''} (${pct}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
              </div>
            </div>
          `;
        })
        .join('');
    },

    renderPriorityDistribution() {
      const container = document.getElementById('priority-breakdown-row');
      if (!container) return;

      const counts = { urgent: 0, high: 0, medium: 0, low: 0 };
      state.tasks.forEach((t) => {
        if (counts[t.priority] !== undefined) {
          counts[t.priority]++;
        }
      });

      container.innerHTML = `
        <div class="priority-stat-pill" style="border-top: 3px solid var(--danger);">
          <span class="priority-stat-label">Urgent</span>
          <span class="priority-stat-count">${counts.urgent}</span>
        </div>
        <div class="priority-stat-pill" style="border-top: 3px solid #f97316;">
          <span class="priority-stat-label">High</span>
          <span class="priority-stat-count">${counts.high}</span>
        </div>
        <div class="priority-stat-pill" style="border-top: 3px solid var(--warning);">
          <span class="priority-stat-label">Medium</span>
          <span class="priority-stat-count">${counts.medium}</span>
        </div>
        <div class="priority-stat-pill" style="border-top: 3px solid var(--success);">
          <span class="priority-stat-label">Low</span>
          <span class="priority-stat-count">${counts.low}</span>
        </div>
      `;
    },

    populateCategoryFilters() {
      // 1. Populate Toolbar Select
      const select = document.getElementById('filter-category');
      if (select) {
        const currentVal = select.value;
        const options = ['<option value="all">All Categories</option>'];
        DEFAULT_CATEGORIES.forEach((cat) => {
          options.push(`<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`);
        });
        select.innerHTML = options.join('');
        select.value = currentVal || 'all';
      }

      // 2. Populate Sidebar Categories List with task counts
      const sidebarList = document.getElementById('sidebar-category-list');
      if (sidebarList) {
        const catCounts = {};
        state.tasks.forEach((t) => {
          catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });

        const allActive = state.filterCategory === 'all' ? 'active' : '';
        let html = `
          <div class="category-nav-item ${allActive}" data-category="all">
            <span class="cat-label-wrap">
              <span class="cat-dot" style="background:#6366f1;"></span>
              <span>All Courses</span>
            </span>
            <span class="cat-count">${state.tasks.length}</span>
          </div>
        `;

        DEFAULT_CATEGORIES.forEach((cat) => {
          const count = catCounts[cat] || 0;
          const color = CATEGORY_COLORS[cat] || '#64748b';
          const isActive = state.filterCategory === cat ? 'active' : '';
          html += `
            <div class="category-nav-item ${isActive}" data-category="${escapeHTML(cat)}">
              <span class="cat-label-wrap">
                <span class="cat-dot" style="background:${color};"></span>
                <span>${escapeHTML(cat)}</span>
              </span>
              <span class="cat-count">${count}</span>
            </div>
          `;
        });

        sidebarList.innerHTML = html;

        // Click listeners on sidebar category items
        sidebarList.querySelectorAll('.category-nav-item').forEach((item) => {
          item.addEventListener('click', () => {
            const cat = item.dataset.category;
            state.filterCategory = cat;
            if (select) select.value = cat;
            this.render();
            // Scroll to tasks section smoothly
            const tasksSection = document.getElementById('tasks-section');
            if (tasksSection) {
              tasksSection.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }
    }
  };

  // --------------------------------------------------------------------------
  // 10. Pomodoro Focus Timer Manager
  // --------------------------------------------------------------------------
  const PomodoroManager = {
    init() {
      const stats = Storage.loadTimerStats();
      state.timer.sessionsToday = stats.sessionsToday;
      state.timer.minutesToday = stats.minutesToday;
      this.updateStatsDisplay();

      this.bindEvents();
      this.updateDisplay();
    },

    bindEvents() {
      // Mode Buttons (Focus 25m, Short Break 5m, Long Break 15m)
      const modeButtons = document.querySelectorAll('.timer-mode-btn');
      modeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          modeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.switchMode(btn.dataset.mode);
        });
      });

      // Play / Pause Button
      const playPauseBtn = document.getElementById('timer-start-pause-btn');
      if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => this.toggleStartPause());
      }

      // Reset Button
      const resetBtn = document.getElementById('timer-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetTimer());
      }

      // Skip Button
      const skipBtn = document.getElementById('timer-skip-btn');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => this.skipSession());
      }

      // Hero banner shortcut button
      const heroPomoBtn = document.getElementById('hero-pomodoro-btn');
      if (heroPomoBtn) {
        heroPomoBtn.addEventListener('click', () => {
          const section = document.getElementById('pomodoro-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
          if (!state.timer.isRunning) {
            this.toggleStartPause();
          }
        });
      }

      // Linked task dropdown change
      const taskSelect = document.getElementById('timer-task-select');
      if (taskSelect) {
        taskSelect.addEventListener('change', (e) => {
          state.timer.linkedTaskId = e.target.value;
        });
      }
    },

    populateTaskDropdown() {
      const select = document.getElementById('timer-task-select');
      if (!select) return;

      const currentVal = select.value;
      const pendingTasks = state.tasks.filter((t) => t.status !== 'completed');

      let html = '<option value="">-- Free General Study Session --</option>';
      pendingTasks.forEach((t) => {
        html += `<option value="${t.id}">${escapeHTML(t.title)} (${t.category})</option>`;
      });

      select.innerHTML = html;
      select.value = currentVal || '';
    },

    linkTaskAndScroll(taskId) {
      const select = document.getElementById('timer-task-select');
      if (select) {
        select.value = taskId;
        state.timer.linkedTaskId = taskId;
      }
      const section = document.getElementById('pomodoro-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      Toast.show('Focus Linked 🍅', 'Assignment linked to Pomodoro timer!', 'info');
    },

    switchMode(mode) {
      this.pauseTimer();
      state.timer.mode = mode;
      state.timer.remainingSeconds = TIMER_PRESETS[mode];
      this.updateDisplay();
    },

    toggleStartPause() {
      if (state.timer.isRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    },

    startTimer() {
      if (state.timer.isRunning) return;
      state.timer.isRunning = true;

      const btnText = document.getElementById('timer-start-pause-text');
      const icon = document.getElementById('timer-play-icon');
      if (btnText) btnText.textContent = 'Pause';
      if (icon) {
        icon.innerHTML = `
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        `;
      }

      playChimeSound(523.25, 0.2); // Start chime (C5)

      state.timer.intervalId = setInterval(() => {
        if (state.timer.remainingSeconds > 0) {
          state.timer.remainingSeconds--;
          this.updateDisplay();
        } else {
          this.handleTimerComplete();
        }
      }, 1000);
    },

    pauseTimer() {
      if (!state.timer.isRunning) return;
      state.timer.isRunning = false;
      clearInterval(state.timer.intervalId);

      const btnText = document.getElementById('timer-start-pause-text');
      const icon = document.getElementById('timer-play-icon');
      if (btnText) btnText.textContent = 'Resume Focus';
      if (icon) {
        icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      }
    },

    resetTimer() {
      this.pauseTimer();
      state.timer.remainingSeconds = TIMER_PRESETS[state.timer.mode];
      const btnText = document.getElementById('timer-start-pause-text');
      if (btnText) btnText.textContent = 'Start Focus';
      this.updateDisplay();
    },

    skipSession() {
      this.resetTimer();
      if (state.timer.mode === 'work') {
        this.switchMode('shortBreak');
        document.querySelector('[data-mode="shortBreak"]')?.click();
      } else {
        this.switchMode('work');
        document.querySelector('[data-mode="work"]')?.click();
      }
    },

    handleTimerComplete() {
      this.pauseTimer();
      playChimeSound(783.99, 0.7); // G5 celebratory bell tone

      if (state.timer.mode === 'work') {
        state.timer.sessionsToday++;
        state.timer.minutesToday += 25;
        Storage.saveTimerStats(state.timer.sessionsToday, state.timer.minutesToday);
        this.updateStatsDisplay();

        // If linked to a task, increment or prompt completion
        let linkedMessage = 'Take a well-deserved 5-minute break!';
        if (state.timer.linkedTaskId) {
          const linkedTask = state.tasks.find((t) => t.id === state.timer.linkedTaskId);
          if (linkedTask) {
            linkedMessage = `25 minutes focused on "${linkedTask.title}"!`;
          }
        }

        Toast.show('🍅 Pomodoro Completed!', linkedMessage, 'success');
        this.switchMode('shortBreak');
        document.querySelector('[data-mode="shortBreak"]')?.click();
      } else {
        Toast.show('Break Finished! ⚡', 'Ready to dive back into study mode?', 'info');
        this.switchMode('work');
        document.querySelector('[data-mode="work"]')?.click();
      }
    },

    updateDisplay() {
      const digitsEl = document.getElementById('timer-digits');
      const ringProgress = document.getElementById('timer-ring-progress');
      const statusText = document.getElementById('timer-status-text');

      const minutes = Math.floor(state.timer.remainingSeconds / 60);
      const seconds = state.timer.remainingSeconds % 60;
      const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (digitsEl) digitsEl.textContent = formatted;
      document.title = state.timer.isRunning ? `(${formatted}) StudyFlow` : 'StudyFlow | Student Task & Productivity';

      // Update circular SVG countdown ring
      if (ringProgress) {
        const totalDuration = TIMER_PRESETS[state.timer.mode];
        const circumference = 596.9; // 2 * PI * 95
        const fraction = state.timer.remainingSeconds / totalDuration;
        const offset = circumference * (1 - fraction);
        ringProgress.style.strokeDashoffset = offset;
      }

      if (statusText) {
        if (!state.timer.isRunning) {
          statusText.textContent = 'Paused / Ready';
        } else if (state.timer.mode === 'work') {
          statusText.textContent = '🔥 Deep Focus in Progress';
        } else {
          statusText.textContent = '☕ Recharge Break';
        }
      }
    },

    updateStatsDisplay() {
      const pomoCountEl = document.getElementById('daily-pomo-count');
      const pomoMinsEl = document.getElementById('daily-pomo-minutes');
      if (pomoCountEl) pomoCountEl.textContent = `${state.timer.sessionsToday} 🍅`;
      if (pomoMinsEl) pomoMinsEl.textContent = `${state.timer.minutesToday} mins`;

      // Also update analytics card counter
      const detailFocus = document.getElementById('analytics-focus-count');
      if (detailFocus) detailFocus.textContent = `${state.timer.sessionsToday} Sessions`;
    }
  };

  // --------------------------------------------------------------------------
  // 11. Modal Management
  // --------------------------------------------------------------------------
  const ModalManager = {
    init() {
      this.bindModalCloseEvents();
      this.bindDataBackupEvents();
    },

    bindModalCloseEvents() {
      // Close buttons
      const closeTaskBtn = document.getElementById('close-task-modal-btn');
      const cancelTaskBtn = document.getElementById('cancel-task-btn');
      if (closeTaskBtn) closeTaskBtn.addEventListener('click', () => this.closeAllModals());
      if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', () => this.closeAllModals());

      const closeDeleteBtn = document.getElementById('close-delete-modal-btn');
      const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
      if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', () => this.closeAllModals());
      if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => this.closeAllModals());

      const closeDataBtn = document.getElementById('close-data-btn');
      const closeDataX = document.getElementById('close-data-modal-btn');
      if (closeDataBtn) closeDataBtn.addEventListener('click', () => this.closeAllModals());
      if (closeDataX) closeDataX.addEventListener('click', () => this.closeAllModals());

      const closeShortcutsBtn = document.getElementById('close-shortcuts-btn-footer');
      const closeShortcutsX = document.getElementById('close-shortcuts-modal-btn');
      if (closeShortcutsBtn) closeShortcutsBtn.addEventListener('click', () => this.closeAllModals());
      if (closeShortcutsX) closeShortcutsX.addEventListener('click', () => this.closeAllModals());

      // Open Data modal buttons
      const openDataBtn = document.getElementById('open-data-modal-btn');
      if (openDataBtn) {
        openDataBtn.addEventListener('click', () => this.openDataModal());
      }

      // Open Shortcuts modal buttons
      const openShortcutsBtn = document.getElementById('open-shortcuts-btn');
      const footerShortcutsBtn = document.getElementById('footer-shortcuts-btn');
      [openShortcutsBtn, footerShortcutsBtn].forEach((btn) => {
        if (btn) btn.addEventListener('click', () => this.openShortcutsModal());
      });

      // Confirm Delete Action
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
          if (state.deletingTaskId) {
            TaskManager.deleteTask(state.deletingTaskId);
            this.closeAllModals();
          }
        });
      }

      // Click outside backdrop to close
      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.closeAllModals();
          }
        });
      });

      // Escape key to close
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAllModals();
        }
      });
    },

    openTaskModal(taskId = null) {
      state.editingTaskId = taskId;
      const modal = document.getElementById('task-modal-overlay');
      const headline = document.getElementById('modal-headline');
      const submitText = document.getElementById('save-task-btn-text');
      const idField = document.getElementById('task-id-field');
      const titleInput = document.getElementById('task-title');
      const catSelect = document.getElementById('task-category');
      const prioritySelect = document.getElementById('task-priority');
      const statusSelect = document.getElementById('task-status');
      const dueDateInput = document.getElementById('task-due-date');
      const pomoRange = document.getElementById('task-pomodoros');
      const pomoDisplay = document.getElementById('pomo-count-display');
      const descInput = document.getElementById('task-description');
      const charCounter = document.getElementById('char-counter');

      // Clear any prior validation states
      titleInput.classList.remove('is-invalid');
      dueDateInput.classList.remove('is-invalid');
      document.getElementById('task-title-error').textContent = '';
      document.getElementById('task-due-date-error').textContent = '';

      if (taskId) {
        // Edit Mode
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;

        headline.textContent = 'Edit Assignment';
        submitText.textContent = 'Save Changes';
        idField.value = task.id;
        titleInput.value = task.title;
        catSelect.value = task.category;
        prioritySelect.value = task.priority;
        statusSelect.value = task.status;
        dueDateInput.value = task.dueDate || '';
        pomoRange.value = task.pomodoros || 2;
        pomoDisplay.textContent = `${task.pomodoros || 2} 🍅 (${(task.pomodoros || 2) * 25} mins)`;
        descInput.value = task.description || '';
        charCounter.textContent = `${(task.description || '').length} / 400`;
      } else {
        // Create Mode
        headline.textContent = 'Create New Assignment';
        submitText.textContent = 'Save Assignment';
        idField.value = '';
        titleInput.value = '';
        catSelect.value = 'Computer Science';
        prioritySelect.value = 'medium';
        statusSelect.value = 'pending';
        dueDateInput.value = getRelativeDateString(1, 12); // Default to tomorrow noon
        pomoRange.value = 2;
        pomoDisplay.textContent = '2 🍅 (50 mins)';
        descInput.value = '';
        charCounter.textContent = '0 / 400';
      }

      modal.hidden = false;
      setTimeout(() => titleInput.focus(), 100);
    },

    openDeleteModal(taskId) {
      state.deletingTaskId = taskId;
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;

      const targetTitle = document.getElementById('delete-task-title-target');
      if (targetTitle) {
        targetTitle.textContent = `"${task.title}"`;
      }

      const modal = document.getElementById('delete-modal-overlay');
      if (modal) modal.hidden = false;
    },

    openDataModal() {
      const modal = document.getElementById('data-modal-overlay');
      if (modal) modal.hidden = false;
    },

    openShortcutsModal() {
      const modal = document.getElementById('shortcuts-modal-overlay');
      if (modal) modal.hidden = false;
    },

    closeAllModals() {
      document.querySelectorAll('.modal-overlay').forEach((m) => {
        m.hidden = true;
      });
      state.editingTaskId = null;
      state.deletingTaskId = null;
    },

    bindDataBackupEvents() {
      // 1. Export JSON
      const exportBtn = document.getElementById('export-json-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const exportData = {
            appName: 'StudyFlow Student Task & Productivity OS',
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            tasks: state.tasks,
            pomodoroStats: {
              sessionsToday: state.timer.sessionsToday,
              minutesToday: state.timer.minutesToday
            }
          };

          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `studyflow-backup-${new Date().toISOString().slice(0, 10)}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          Toast.show('Backup Exported 📥', 'Your tasks have been downloaded as a JSON file.', 'success');
        });
      }

      // 2. Import JSON
      const importTriggerBtn = document.getElementById('import-json-trigger-btn');
      const importInput = document.getElementById('import-json-input');
      if (importTriggerBtn && importInput) {
        importTriggerBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target.result);
              let importedTasks = [];
              if (Array.isArray(parsed)) {
                importedTasks = parsed;
              } else if (parsed && Array.isArray(parsed.tasks)) {
                importedTasks = parsed.tasks;
              }

              if (importedTasks.length > 0) {
                state.tasks = importedTasks;
                Storage.saveTasks(state.tasks);
                TaskManager.render();
                Toast.show('Import Successful! 📤', `Loaded ${importedTasks.length} tasks from file.`, 'success');
                ModalManager.closeAllModals();
              } else {
                Toast.show('Import Failed', 'No valid task records found in JSON.', 'danger');
              }
            } catch (err) {
              Toast.show('Invalid JSON', 'Could not parse the selected JSON file.', 'danger');
            }
            importInput.value = '';
          };
          reader.readAsText(file);
        });
      }

      // 3. Reset Demo Data
      const resetModalBtn = document.getElementById('modal-reset-demo-btn');
      const footerResetBtn = document.getElementById('footer-reset-demo-btn');
      const handleReset = () => {
        if (confirm('Reset all assignments to original student sample tasks? Any customized tasks will be replaced.')) {
          state.tasks = [...SAMPLE_TASKS];
          Storage.saveTasks(state.tasks);
          TaskManager.render();
          Toast.show('Sample Tasks Restored 🔄', 'Loaded demonstration coursework data.', 'info');
          ModalManager.closeAllModals();
        }
      };

      if (resetModalBtn) resetModalBtn.addEventListener('click', handleReset);
      if (footerResetBtn) footerResetBtn.addEventListener('click', handleReset);
    }
  };

  // --------------------------------------------------------------------------
  // 12. Keyboard Shortcuts Listener
  // --------------------------------------------------------------------------
  function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing inside an input, textarea, or select
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // 'N' or 'n' -> Open New Task Modal
      if ((e.key === 'n' || e.key === 'N') && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        ModalManager.openTaskModal();
        return;
      }

      // '/' -> Focus Global Search
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 'D' or 'd' -> Toggle Dark / Light theme
      if ((e.key === 'd' || e.key === 'D') && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const next = state.theme === 'dark' ? 'light' : 'dark';
        ThemeManager.setTheme(next);
        return;
      }

      // Spacebar -> Toggle Pomodoro timer
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        PomodoroManager.toggleStartPause();
        return;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 13. Mobile Responsive Sidebar Drawer
  // --------------------------------------------------------------------------
  function initMobileSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('sidebar-open');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('sidebar-open');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // Close sidebar on nav item click on mobile
    document.querySelectorAll('.sidebar-nav .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          closeSidebar();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 14. Application Bootstrap
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initInspirationalQuotes();
    ThemeManager.init();
    TaskManager.init();
    PomodoroManager.init();
    ModalManager.init();
    initKeyboardShortcuts();
    initMobileSidebar();

    console.log('%c StudyFlow Student Productivity OS Loaded Successfully! 🚀', 'color: #4f46e5; font-size: 14px; font-weight: bold;');
  });

})();

