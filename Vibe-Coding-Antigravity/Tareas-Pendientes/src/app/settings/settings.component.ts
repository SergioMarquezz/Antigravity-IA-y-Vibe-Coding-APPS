import { ChangeDetectionStrategy, Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./settings.component.css'],
  template: `
    <!-- TopAppBar -->
    <header class="topbar">
      <!-- Brand (Mobile Only) -->
      <div class="topbar__brand topbar__brand--mobile">
        <h1 class="topbar__title">Momentum Task</h1>
      </div>

      <!-- Breadcrumbs (Desktop Only) -->
      <div class="topbar__brand topbar__brand--desktop" style="color:var(--color-on-surface-variant);font-size:1.4rem;">
        <span>Cuenta</span>
        <span class="material-symbols-outlined" style="font-size:1.6rem;">chevron_right</span>
        <span style="font-weight:600;color:var(--color-on-surface);">Ajustes</span>
      </div>

      <!-- Trailing Actions -->
      <div class="topbar__actions">
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
        <button class="topbar__avatar-btn" aria-label="Perfil">
          <img [src]="profileImageUrl()" alt="Perfil de usuario">
        </button>
      </div>
    </header>

    <!-- Settings Form -->
    <main class="settings-main">
      <div class="settings-heading">
        <h2>Ajustes de Perfil</h2>
        <p>Actualiza tu información personal y la imagen que los demás verán.</p>
      </div>

      <!-- Form Card -->
      <div class="settings-card">
        <div class="settings-card__accent"></div>
        <div class="settings-card__body">
          <form class="settings-form" (submit)="saveSettings($event)">

            <!-- Profile Image Row -->
            <div class="settings-avatar-row">
              <div class="settings-avatar-wrap">
                <img [src]="profileImageUrl()" alt="Avatar actual">
              </div>
              <div class="settings-avatar-fields">
                <div class="form-field">
                  <label for="profile_image_url" class="form-label">URL de imagen de perfil</label>
                  <div class="form-input-wrap">
                    <div class="form-input-icon">
                      <span class="material-symbols-outlined">link</span>
                    </div>
                    <input type="url" id="profile_image_url" name="profile_image_url"
                           placeholder="https://ejemplo.com/avatar.jpg"
                           [value]="profileImageUrl()" (input)="updateImageUrl($event)"
                           class="form-input form-input--with-icon">
                  </div>
                  <p class="form-hint">Pega un enlace directo a una imagen (JPG, PNG). Recomendado 256x256px.</p>
                </div>
              </div>
            </div>

            <!-- Name Fields -->
            <div class="settings-fields-grid">
              <div class="form-field">
                <label for="first_name" class="form-label">Nombre</label>
                <input type="text" id="first_name" name="first_name" placeholder="Tu nombre"
                       [value]="firstName()" (input)="updateFirstName($event)"
                       class="form-input">
              </div>
              <div class="form-field">
                <label for="last_name" class="form-label">Apellidos</label>
                <input type="text" id="last_name" name="last_name" placeholder="Tus apellidos"
                       [value]="lastName()" (input)="updateLastName($event)"
                       class="form-input">
              </div>
            </div>

            <!-- Actions -->
            <div class="settings-actions">
              <button type="button" (click)="resetSettings()" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                <span class="material-symbols-outlined">save</span>
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `
})
export class SettingsComponent implements OnInit {
  toastService  = inject(ToastService);
  taskService   = inject(TaskService);
  platformId    = inject(PLATFORM_ID);

  DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5wqWkT2nWfws9vifIaCDcGLUIJrft3f6hbKtFkkLpwfF6P3s_3SBfFH4CBtdHwXCYgSXGW7u4h4tw74YrNTZmfaWSpLeN6tO8qtz6qGUWPzWw9-Yqk41j2agksbODVM8vMG4d4HiIarPkhII6cdKu14d4T4eCPQZUZmygS_JJV-lYE1fPsfcHYUR6c5Qptqm61K_OLEYP74zJ5uR44fUwSiUUdn2VaXwimO43pnstGhTb2XYjF7MbBHB0vNASMkVVcA9HYxDZCm6t';

  profileImageUrl = signal<string>(this.DEFAULT_AVATAR);
  firstName       = signal<string>('Sergio');
  lastName        = signal<string>('Márquez');

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedImg   = localStorage.getItem('profile_image_url');
      const savedFirst = localStorage.getItem('first_name');
      const savedLast  = localStorage.getItem('last_name');
      if (savedImg)   this.profileImageUrl.set(savedImg);
      if (savedFirst) this.firstName.set(savedFirst);
      if (savedLast)  this.lastName.set(savedLast);
    }
  }

  updateImageUrl(event: Event)  { this.profileImageUrl.set((event.target as HTMLInputElement).value); }
  updateFirstName(event: Event) { this.firstName.set((event.target as HTMLInputElement).value); }
  updateLastName(event: Event)  { this.lastName.set((event.target as HTMLInputElement).value); }

  resetSettings() {
    this.ngOnInit();
    this.toastService.show('Cambios descartados', 'info');
  }

  saveSettings(event: Event) {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('profile_image_url', this.profileImageUrl() || this.DEFAULT_AVATAR);
      localStorage.setItem('first_name', this.firstName());
      localStorage.setItem('last_name', this.lastName());
      this.toastService.show('Ajustes guardados correctamente', 'settings');
    }
  }
}
