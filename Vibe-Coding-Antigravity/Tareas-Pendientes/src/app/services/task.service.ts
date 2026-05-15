import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskCategory = 'all' | 'work' | 'personal' | 'home' | 'other';

export interface Task {
  id: string;
  title: string;
  category: string;
  isPriority: boolean;
  time?: string;
  dateStr: string;
  completed: boolean;
  categoryLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'momentum_tasks';
  private platformId = inject(PLATFORM_ID);
  
  tasks = signal<Task[]>([]);
  statusFilter = signal<TaskStatus>('all');
  categoryFilter = signal<TaskCategory>('all');

  pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  completedCount = computed(() => this.tasks().filter(t => t.completed).length);

  filteredTasks = computed(() => {
    let result = this.tasks();
    
    if (this.statusFilter() === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (this.statusFilter() === 'completed') {
      result = result.filter(t => t.completed);
    }

    if (this.categoryFilter() !== 'all') {
      result = result.filter(t => t.category === this.categoryFilter());
    }

    return result;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTasks();
      effect(() => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks()));
      });
    } else {
      // Mock for SSR initially
      this.tasks.set([
        { id: '1', title: 'Añadir tareas desde SSR', category: 'work', categoryLabel: 'Trabajo', isPriority: false, dateStr: 'Hoy', completed: false },
      ]);
    }
  }

  private loadTasks() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tasks.set(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing tasks', e);
      }
    }
  }

  addTask(title: string, category: string, isPriority: boolean = false) {
    const map: Record<string, string> = { work: 'Trabajo', personal: 'Personal', home: 'Hogar', other: 'Otro' };
    const dateStr = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date());
    
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      categoryLabel: map[category] || 'Otro',
      isPriority,
      dateStr,
      completed: false
    };
    
    this.tasks.update(tasks => [newTask, ...tasks]);
  }

  editTask(id: string, updates: Partial<Task>) {
    const map: Record<string, string> = { work: 'Trabajo', personal: 'Personal', home: 'Hogar', other: 'Otro' };
    this.tasks.update(tasks => tasks.map(t => {
      if (t.id === id) {
        const updatedTask = { ...t, ...updates };
        if (updates.category) {
          updatedTask.categoryLabel = map[updates.category] || 'Otro';
        }
        return updatedTask;
      }
      return t;
    }));
  }

  toggleComplete(id: string) {
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  deleteTask(id: string) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
  }
}
