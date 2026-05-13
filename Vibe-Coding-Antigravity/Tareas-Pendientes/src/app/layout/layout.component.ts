import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./layout.component.css'],
  template: `
    <div class="app-shell">

      <!-- SideNavBar (Desktop) -->
      <nav class="sidenav">
        <!-- Header -->
        <div class="sidenav__header">
          <div class="sidenav__logo-icon">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">task_alt</span>
          </div>
          <div>
            <h1 class="sidenav__brand-name">Momentum</h1>
            <p class="sidenav__brand-sub">Task Master</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="sidenav__nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="sidenav__link">
            <span class="material-symbols-outlined">dashboard</span>
            <span>Panel Control</span>
          </a>

          <a routerLink="/analytics" routerLinkActive="active"
             class="sidenav__link">
            <span class="material-symbols-outlined">analytics</span>
            <span>Análisis</span>
          </a>

          <a routerLink="/settings" routerLinkActive="active"
             class="sidenav__link">
            <span class="material-symbols-outlined">settings</span>
            <span>Ajustes</span>
          </a>
        </div>

        <!-- CTA -->
        <div class="sidenav__cta">
          <button class="sidenav__cta-btn" (click)="openModal()">
            <span class="material-symbols-outlined">add</span>
            Nueva Tarea
          </button>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="main-content">
        <router-outlet></router-outlet>

        <!-- BottomNavBar (Mobile Only) -->
        <nav class="bottom-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="bottom-nav__link">
            <span class="material-symbols-outlined">list</span>
            <span>Todas</span>
          </a>
          <a routerLink="/analytics" routerLinkActive="active"
             class="bottom-nav__link">
            <span class="material-symbols-outlined">pending_actions</span>
            <span>Tendencias</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active"
             class="bottom-nav__link">
            <span class="material-symbols-outlined">settings</span>
            <span>Ajustes</span>
          </a>
        </nav>
      </div>

      <!-- Toast Container -->
      <div class="toast-container">
        @for (toast of toastService.toasts(); track toast.id) {
          <div class="toast" [class]="'toast--' + toast.type">
            <span class="material-symbols-outlined">{{ getToastIcon(toast.type) }}</span>
            {{ toast.message }}
            <button (click)="toastService.remove(toast.id)" class="toast__close">
              <span class="material-symbols-outlined" style="font-size:1.6rem;">close</span>
            </button>
          </div>
        }
      </div>

      <!-- ─── Modal Nueva Tarea ─── -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeOnBackdrop($event)">
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

            <!-- Modal Header -->
            <div class="modal__header">
              <div class="modal__header-icon">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">task_alt</span>
              </div>
              <div>
                <h2 class="modal__title" id="modal-title">Nueva Tarea</h2>
                <p class="modal__subtitle">Añade los detalles de tu nueva tarea</p>
              </div>
              <button class="modal__close-btn" (click)="closeModal()" aria-label="Cerrar modal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <form class="modal__form" (submit)="submitTask($event)">

              <!-- Título -->
              <div class="modal__field">
                <label for="modal-title-input" class="modal__label">
                  <span class="material-symbols-outlined">edit_note</span>
                  Título de la tarea <span class="modal__required">*</span>
                </label>
                <input
                  id="modal-title-input"
                  type="text"
                  class="modal__input"
                  placeholder="¿Qué hay que hacer?"
                  [(value)]="taskTitle"
                  (input)="taskTitle = $any($event.target).value"
                  autofocus
                />
              </div>

              <!-- Categoría + Prioridad -->
              <div class="modal__row">
                <div class="modal__field">
                  <label for="modal-category" class="modal__label">
                    <span class="material-symbols-outlined">label</span>
                    Categoría
                  </label>
                  <div class="modal__select-wrap">
                    <select id="modal-category" class="modal__select"
                            (change)="taskCategory = $any($event.target).value">
                      <option value="work">💼 Trabajo</option>
                      <option value="personal">👤 Personal</option>
                      <option value="home">🏠 Hogar</option>
                      <option value="other">📌 Otro</option>
                    </select>
                    <span class="modal__select-arrow material-symbols-outlined">expand_more</span>
                  </div>
                </div>

                <div class="modal__field">
                  <label class="modal__label">
                    <span class="material-symbols-outlined">priority_high</span>
                    Prioridad
                  </label>
                  <label class="modal__toggle-label">
                    <input type="checkbox" class="modal__toggle-input"
                           (change)="taskPriority = $any($event.target).checked" />
                    <span class="modal__toggle-track">
                      <span class="modal__toggle-thumb"></span>
                    </span>
                    <span class="modal__toggle-text">Alta prioridad</span>
                  </label>
                </div>
              </div>

              <!-- Hora -->
              <div class="modal__field">
                <label for="modal-time" class="modal__label">
                  <span class="material-symbols-outlined">schedule</span>
                  Hora (opcional)
                </label>
                <input
                  id="modal-time"
                  type="time"
                  class="modal__input modal__input--time"
                  (input)="taskTime = $any($event.target).value"
                />
              </div>

              <!-- Validation error -->
              @if (showValidation()) {
                <div class="modal__error">
                  <span class="material-symbols-outlined">error</span>
                  El título de la tarea no puede estar vacío.
                </div>
              }

              <!-- Actions -->
              <div class="modal__actions">
                <button type="button" class="modal__btn modal__btn--cancel" (click)="closeModal()">
                  Cancelar
                </button>
                <button type="submit" class="modal__btn modal__btn--submit">
                  <span class="material-symbols-outlined">add_task</span>
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class LayoutComponent {
  toastService = inject(ToastService);
  taskService  = inject(TaskService);

  modalOpen       = signal(false);
  showValidation  = signal(false);

  taskTitle    = '';
  taskCategory = 'work';
  taskPriority = false;
  taskTime     = '';

  openModal() {
    this.taskTitle    = '';
    this.taskCategory = 'work';
    this.taskPriority = false;
    this.taskTime     = '';
    this.showValidation.set(false);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  closeOnBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  submitTask(event: Event) {
    event.preventDefault();
    const title = this.taskTitle.trim();

    if (!title) {
      this.showValidation.set(true);
      return;
    }

    this.taskService.addTask(title, this.taskCategory, this.taskPriority);
    this.toastService.show(`Tarea creada: ${title}`, 'success');
    this.closeModal();
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':  return 'check_circle';
      case 'error':    return 'error';
      case 'settings': return 'settings_suggest';
      case 'info':     return 'info';
      default:         return 'info';
    }
  }
}
