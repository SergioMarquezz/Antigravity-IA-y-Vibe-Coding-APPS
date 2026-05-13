import { ChangeDetectionStrategy, Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TaskService, Task } from '../services/task.service';
import { ToastService } from '../services/toast.service';
import { AiService } from '../services/ai.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard.component.css'],
  template: `
    <!-- TopAppBar -->
    <header class="topbar">
      <div class="topbar__brand topbar__brand--mobile">
        <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:2.8rem;font-variation-settings:'FILL' 1;">check_circle</span>
        <h1 class="topbar__title">Momentum</h1>
      </div>
      <div class="topbar__brand topbar__brand--desktop">
        <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:3.2rem;font-variation-settings:'FILL' 1;">check_circle</span>
        <h1 class="topbar__title">Momentum Tareas</h1>
      </div>

      <div class="topbar__actions">
        <p class="topbar__date">{{ todayDate }}</p>

        <div class="topbar__badge">
          <span class="text-label-sm">Pendientes: <strong class="text-primary">{{ taskService.pendingCount() }}</strong></span>
          <span class="topbar__badge-sep">|</span>
          <span class="text-label-sm">Completadas: <strong style="color:var(--color-secondary)">{{ taskService.completedCount() }}</strong></span>
        </div>

        <button class="topbar__icon-btn" aria-label="Calendario">
          <span class="material-symbols-outlined">calendar_today</span>
        </button>
        <button class="topbar__icon-btn" aria-label="Notificaciones">
          <span class="material-symbols-outlined">notifications</span>
          @if (taskService.pendingCount() > 0) {
            <span class="topbar__notif-badge">{{ taskService.pendingCount() }}</span>
          }
        </button>

        <!-- Theme Toggle -->
        <div class="theme-toggle" title="Cambiar tema">
          <span class="theme-toggle__icon material-symbols-outlined">
            {{ themeService.isDark() ? 'dark_mode' : 'light_mode' }}
          </span>
          <div
            class="theme-toggle__track"
            [class.theme-toggle__track--active]="themeService.isDark()"
            (click)="themeService.toggle()"
            role="switch"
            [attr.aria-checked]="themeService.isDark()"
            aria-label="Activar modo oscuro"
          >
            <div class="theme-toggle__thumb"
                 [class.theme-toggle__thumb--active]="themeService.isDark()">
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'dark_mode' : 'light_mode' }}
              </span>
            </div>
          </div>
        </div>

        <button class="topbar__avatar-btn" aria-label="Perfil">
          <img [src]="avatarUrl" alt="Avatar de usuario">
        </button>
      </div>
    </header>

    <main class="dashboard-main">

      <!-- Mobile Date Header -->
      <div class="mobile-date-header">
        <div>
          <p class="mobile-date-header__label">Enfoque de Hoy</p>
          <h2 class="mobile-date-header__value">{{ todayDate }}</h2>
        </div>
        <div class="mobile-date-header__counts">
          <span class="mobile-date-header__count">Pend: <strong class="text-primary">{{ taskService.pendingCount() }}</strong></span>
          <span class="mobile-date-header__count">Comp: <strong style="color:var(--color-secondary)">{{ taskService.completedCount() }}</strong></span>
        </div>
      </div>

      <!-- Add Task Input -->
      <section class="add-task-section">
        <form class="add-task-form" (submit)="addTask($event)">
          <div class="add-task-form__input-wrap">
            <input #taskInput type="text" placeholder="¿Qué hay que hacer?"
                   class="add-task-input" />
          </div>
          <div class="add-task-select-wrap">
            <select #taskCategory class="add-task-select">
              <option value="work" selected>Trabajo</option>
              <option value="personal">Personal</option>
              <option value="home">Hogar</option>
              <option value="other">Otro</option>
            </select>
            <div class="add-task-select-arrow">
              <span class="material-symbols-outlined">expand_more</span>
            </div>
          </div>
          <button type="button" (click)="aiService.suggestTask()" title="Sugerir con IA"
                  class="add-task-ai-btn">
            <span class="material-symbols-outlined">auto_awesome</span>
            Sugerir
          </button>
          <button type="submit" class="add-task-submit-btn" aria-label="Añadir tarea">
            <span class="material-symbols-outlined">add</span>
          </button>
        </form>
      </section>

      <!-- Status Filters -->
      <section class="filter-section">
        <button (click)="taskService.statusFilter.set('all')"
                [class]="'filter-pill' + (taskService.statusFilter() === 'all' ? ' active' : '')">
          Todas
        </button>
        <button (click)="taskService.statusFilter.set('pending')"
                [class]="'filter-pill' + (taskService.statusFilter() === 'pending' ? ' active' : '')">
          Pendientes
        </button>
        <button (click)="taskService.statusFilter.set('completed')"
                [class]="'filter-pill' + (taskService.statusFilter() === 'completed' ? ' active' : '')">
          Completadas
        </button>
      </section>

      <!-- Category Filters -->
      <section class="category-section">
        <div class="category-section__inner">
          <span class="category-section__label">Categorías:</span>
          <button (click)="taskService.categoryFilter.set('all')"
                  [class]="'filter-pill' + (taskService.categoryFilter() === 'all' ? ' active' : '')">Todas</button>
          <button (click)="taskService.categoryFilter.set('work')"
                  [class]="'filter-pill' + (taskService.categoryFilter() === 'work' ? ' active' : '')">Trabajo</button>
          <button (click)="taskService.categoryFilter.set('personal')"
                  [class]="'filter-pill' + (taskService.categoryFilter() === 'personal' ? ' active' : '')">Personal</button>
          <button (click)="taskService.categoryFilter.set('home')"
                  [class]="'filter-pill' + (taskService.categoryFilter() === 'home' ? ' active' : '')">Hogar</button>
        </div>
      </section>

      <!-- Task List -->
      <section class="task-list">
        @for (task of taskService.filteredTasks(); track task.id) {
          <div [class]="getTaskCardClass(task)">

            <!-- Checkbox -->
            <label class="task-checkbox-label">
              <input type="checkbox" class="task-checkbox-input"
                     [checked]="task.completed" (change)="toggleComplete(task.id)"/>
              <div [class]="'task-checkbox-box' + (task.completed ? ' task-checkbox-box--checked' : '')">
                <span class="material-symbols-outlined"
                      [class.check-icon--hidden]="!task.completed"
                      style="font-variation-settings:'FILL' 1;">check</span>
              </div>
            </label>

            <!-- Body -->
            <div class="task-body">
              @if (editingTaskId() === task.id) {
                <form (submit)="saveEdit($event, task.id)" class="task-edit-form">
                  <input #editInput type="text" [value]="task.title"
                         class="task-edit-input"
                         (blur)="saveEditOnBlur(editInput.value, task.id)" autofocus>
                  <button type="submit" class="task-edit-btn task-edit-btn--save">
                    <span class="material-symbols-outlined">save</span>
                  </button>
                  <button type="button" (click)="cancelEdit()" class="task-edit-btn task-edit-btn--cancel">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </form>
              } @else {
                <span [class]="'task-title' + (task.completed ? ' task-title--completed' : '')"
                      (dblclick)="startEdit(task)">{{ task.title }}</span>
                <div class="task-meta">
                  @if (task.isPriority && !task.completed) {
                    <span class="task-tag task-tag--priority">Prioridad alta</span>
                  }
                  @if (task.category) {
                    <span [class]="'task-tag ' + getCategoryTag(task.category)">{{ task.categoryLabel }}</span>
                  }
                  @if (task.time && !task.completed) {
                    <span class="task-time">
                      <span class="material-symbols-outlined">schedule</span> {{ task.time }}
                    </span>
                  }
                </div>
              }
            </div>

            <!-- Date -->
            <span class="task-date">Creado el {{ task.dateStr }}</span>

            <!-- Actions -->
            <div class="task-actions">
              @if (!task.completed && editingTaskId() !== task.id) {
                <button (click)="startEdit(task)" aria-label="Editar tarea"
                        class="task-action-btn task-action-btn--edit">
                  <span class="material-symbols-outlined">edit</span>
                </button>
              }
              <button (click)="deleteTask(task.id)" aria-label="Eliminar tarea"
                      class="task-action-btn task-action-btn--delete">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined">task</span>
            <h3 class="empty-state__title">No hay tareas pendientes</h3>
            <p class="empty-state__text">Añade una nueva tarea arriba para empezar.</p>
          </div>
        }
      </section>
    </main>
  `
})
export class DashboardComponent {
  taskService  = inject(TaskService);
  toastService = inject(ToastService);
  aiService    = inject(AiService);
  platformId   = inject(PLATFORM_ID);
  themeService = inject(ThemeService);

  readonly DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5wqWkT2nWfws9vifIaCDcGLUIJrft3f6hbKtFkkLpwfF6P3s_3SBfFH4CBtdHwXCYgSXGW7u4h4tw74YrNTZmfaWSpLeN6tO8qtz6qGUWPzWw9-Yqk41j2agksbODVM8vMG4d4HiIarPkhII6cdKu14d4T4eCPQZUZmygS_JJV-lYE1fPsfcHYUR6c5Qptqm61K_OLEYP74zJ5uR44fUwSiUUdn2VaXwimO43pnstGhTb2XYjF7MbBHB0vNASMkVVcA9HYxDZCm6t';

  todayDate     = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  editingTaskId = signal<string | null>(null);

  get avatarUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('profile_image_url') || this.DEFAULT_AVATAR;
    }
    return this.DEFAULT_AVATAR;
  }

  getTaskCardClass(task: Task): string {
    const base = 'task-card';
    if (task.completed) return `${base} task-card--completed`;
    if (task.isPriority) return `${base} task-card--priority`;
    return `${base} task-card--normal`;
  }

  getCategoryTag(category: string): string {
    switch (category) {
      case 'work':     return 'task-tag--work';
      case 'personal': return 'task-tag--personal';
      default:         return 'task-tag--other';
    }
  }

  toggleComplete(id: string) {
    this.taskService.toggleComplete(id);
    const task = this.taskService.tasks().find(t => t.id === id);
    if (task) {
      this.toastService.show(
        task.completed ? `Tarea completada: ${task.title}` : `Tarea reactivada: ${task.title}`,
        task.completed ? 'success' : 'info'
      );
    }
  }

  deleteTask(id: string) {
    const task = this.taskService.tasks().find(t => t.id === id);
    this.taskService.deleteTask(id);
    this.toastService.show(`Tarea eliminada: ${task?.title}`, 'error');
  }

  addTask(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const select = form.querySelector('select') as HTMLSelectElement;
    if (input.value.trim()) {
      this.taskService.addTask(input.value.trim(), select ? select.value : 'other');
      this.toastService.show(`Tarea creada: ${input.value.trim()}`, 'success');
      input.value = '';
    } else {
      this.toastService.show('El título de la tarea no puede estar vacío', 'error');
    }
  }

  startEdit(task: Task)    { this.editingTaskId.set(task.id); }
  cancelEdit()             { this.editingTaskId.set(null); }

  saveEdit(event: Event, id: string) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    this.saveEditOnBlur(input.value, id);
  }

  saveEditOnBlur(value: string, id: string) {
    if (value.trim()) {
      this.taskService.editTask(id, value.trim());
      this.toastService.show('Tarea actualizada correctamente', 'success');
    } else {
      this.toastService.show('El título no puede estar vacío', 'error');
    }
    this.editingTaskId.set(null);
  }
}
