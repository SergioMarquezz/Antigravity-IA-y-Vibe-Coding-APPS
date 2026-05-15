import { ChangeDetectionStrategy, Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TaskService, Task } from '../services/task.service';
import { ToastService } from '../services/toast.service';
import { AiService } from '../services/ai.service';
import { ThemeService } from '../services/theme.service';

interface DeleteTarget {
  id: string;
  title: string;
}


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

      <!-- AI Suggestion -->
      <section class="add-task-section" style="justify-content: flex-end;">
        <button type="button" (click)="aiService.suggestTask()" title="Sugerir con IA"
                class="add-task-ai-btn" style="padding: 1.2rem 2.4rem;">
          <span class="material-symbols-outlined">auto_awesome</span>
          Sugerir Tarea con IA
        </button>
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
              <button (click)="requestDelete(task)" aria-label="Eliminar tarea"
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

      <!-- Modal Editar Tarea -->
      @if (editModalOpen()) {
        <div class="modal-backdrop" (click)="closeOnBackdrop($event)">
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
            <div class="modal__header">
              <div class="modal__header-icon">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">edit_note</span>
              </div>
              <div>
                <h2 class="modal__title" id="edit-modal-title">Editar Tarea</h2>
                <p class="modal__subtitle">Modifica los detalles de la tarea</p>
              </div>
              <button class="modal__close-btn" (click)="cancelEdit()" aria-label="Cerrar modal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <form class="modal__form" (submit)="saveEditSubmit($event)">
              <div class="modal__field">
                <label for="edit-title-input" class="modal__label">
                  <span class="material-symbols-outlined">edit_note</span> Título <span class="modal__required">*</span>
                </label>
                <input id="edit-title-input" type="text" class="modal__input" placeholder="Título de la tarea"
                       [(value)]="editTaskTitle" (input)="editTaskTitle = $any($event.target).value" autofocus />
              </div>
              <div class="modal__row">
                <div class="modal__field">
                  <label for="edit-category" class="modal__label">
                    <span class="material-symbols-outlined">label</span> Categoría
                  </label>
                  <div class="modal__select-wrap">
                    <select id="edit-category" class="modal__select" (change)="editTaskCategory = $any($event.target).value">
                      <option value="work" [selected]="editTaskCategory === 'work'">💼 Trabajo</option>
                      <option value="personal" [selected]="editTaskCategory === 'personal'">👤 Personal</option>
                      <option value="home" [selected]="editTaskCategory === 'home'">🏠 Hogar</option>
                      <option value="other" [selected]="editTaskCategory === 'other'">📌 Otro</option>
                    </select>
                    <span class="modal__select-arrow material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <div class="modal__field">
                  <label class="modal__label">
                    <span class="material-symbols-outlined">priority_high</span> Prioridad
                  </label>
                  <label class="modal__toggle-label">
                    <input type="checkbox" class="modal__toggle-input" [checked]="editTaskPriority"
                           (change)="editTaskPriority = $any($event.target).checked" />
                    <span class="modal__toggle-track">
                      <span class="modal__toggle-thumb"></span>
                    </span>
                    <span class="modal__toggle-text">Alta prioridad</span>
                  </label>
                </div>
              </div>
              <div class="modal__field">
                <label for="edit-time" class="modal__label">
                  <span class="material-symbols-outlined">schedule</span> Hora (opcional)
                </label>
                <input id="edit-time" type="time" class="modal__input modal__input--time"
                       [(value)]="editTaskTime" (input)="editTaskTime = $any($event.target).value" />
              </div>
              @if (showEditValidation()) {
                <div class="modal__error">
                  <span class="material-symbols-outlined">error</span> El título no puede estar vacío.
                </div>
              }
              <div class="modal__actions">
                <button type="button" class="modal__btn modal__btn--cancel" (click)="cancelEdit()">Cancelar</button>
                <button type="submit" class="modal__btn modal__btn--submit">
                  <span class="material-symbols-outlined">save</span> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </main>

    <!-- ─── Modal Confirmar Eliminación ─── -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="closeDeleteOnBackdrop($event)">
        <div class="modal modal--danger" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">

          <!-- Header -->
          <div class="modal__header">
            <div class="modal__header-icon modal__header-icon--danger">
              <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">delete_forever</span>
            </div>
            <div>
              <h2 class="modal__title" id="delete-modal-title">Eliminar tarea</h2>
              <p class="modal__subtitle">Esta acción no se puede deshacer</p>
            </div>
            <button class="modal__close-btn" (click)="cancelDelete()" aria-label="Cerrar modal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <div class="delete-confirm__task-preview">
              <span class="material-symbols-outlined delete-confirm__task-icon">task_alt</span>
              <p class="delete-confirm__task-title">"{{ deleteTarget()!.title }}"</p>
            </div>
            <p class="delete-confirm__message">
              ¿Estás seguro de que quieres eliminar esta tarea? Se borrará permanentemente y no podrás recuperarla.
            </p>
          </div>

          <!-- Actions -->
          <div class="modal__actions">
            <button type="button" class="modal__btn modal__btn--cancel" (click)="cancelDelete()">
              Cancelar
            </button>
            <button type="button" class="modal__btn modal__btn--danger" (click)="confirmDelete()">
              <span class="material-symbols-outlined">delete</span>
              Eliminar
            </button>
          </div>

        </div>
      </div>
    }

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

  editModalOpen = signal(false);
  showEditValidation = signal(false);
  deleteTarget = signal<DeleteTarget | null>(null);
  
  editTaskTitle = '';
  editTaskCategory = 'work';
  editTaskPriority = false;
  editTaskTime = '';

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

  requestDelete(task: Task) {
    this.deleteTarget.set({ id: task.id, title: task.title });
  }

  cancelDelete() {
    this.deleteTarget.set(null);
  }

  closeDeleteOnBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancelDelete();
    }
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.taskService.deleteTask(target.id);
    this.toastService.show(`Tarea eliminada: ${target.title}`, 'error');
    this.deleteTarget.set(null);
  }

  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editTaskTitle = task.title;
    this.editTaskCategory = task.category;
    this.editTaskPriority = task.isPriority;
    this.editTaskTime = task.time || '';
    this.showEditValidation.set(false);
    this.editModalOpen.set(true);
  }

  cancelEdit() {
    this.editModalOpen.set(false);
    this.editingTaskId.set(null);
  }

  closeOnBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancelEdit();
    }
  }

  saveEditSubmit(event: Event) {
    event.preventDefault();
    const title = this.editTaskTitle.trim();
    if (!title) {
      this.showEditValidation.set(true);
      return;
    }
    
    const id = this.editingTaskId();
    if (id) {
      this.taskService.editTask(id, {
        title,
        category: this.editTaskCategory,
        isPriority: this.editTaskPriority,
        time: this.editTaskTime
      });
      this.toastService.show('Tarea actualizada correctamente', 'success');
    }
    this.cancelEdit();
  }
}
