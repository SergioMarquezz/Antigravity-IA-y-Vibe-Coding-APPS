import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { TaskService } from './task.service';
import { ToastService } from './toast.service';

declare const GEMINI_API_KEY: string;

@Injectable({
  providedIn: 'root'
})
export class AiService {
  taskService = inject(TaskService);
  toastService = inject(ToastService);
  
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY && GEMINI_API_KEY !== 'undefined') {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      }
    } catch (e) {
      console.warn('Gemini API Key no disponible. La sugerencia de tareas usará datos locales.');
    }
  }

  async suggestTask() {
    this.toastService.show('Generando sugerencia de tarea...', 'info');
    
    if (this.ai) {
      try {
        const currentTasks = this.taskService.tasks().map(t => t.title).join(', ');
        const prompt = `Actúa como un asistente de productividad. Basado en las siguientes tareas actuales del usuario: [${currentTasks}], sugiere UNA nueva tarea corta (máximo 8 palabras) que tenga sentido añadir a continuación, algo cotidiano o relacionado. Devuelve solo el título de la tarea, nada más.`;
        
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        let suggestion = response.text || '';
        suggestion = suggestion.replace(/['"]/g, '').trim();
        
        if (suggestion) {
          this.taskService.addTask(suggestion, 'other', false);
          this.toastService.show(`Tarea sugerida por IA añadida: ${suggestion}`, 'success');
          return;
        }
      } catch (error) {
        console.error('Error con Gemini:', error);
      }
    }
    
    // Fallback if no AI or error
    const fallbacks = [
      'Revisar correos electrónicos pendientes',
      'Hacer ejercicio por 30 minutos',
      'Planificar las metas de la semana',
      'Leer un capítulo de un libro',
      'Organizar el espacio de trabajo'
    ];
    const randomTask = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    this.taskService.addTask(randomTask, 'other', false);
    this.toastService.show(`Tarea sugerida añadida: ${randomTask}`, 'success');
  }
}
