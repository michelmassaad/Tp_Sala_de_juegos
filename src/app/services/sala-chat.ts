import { Injectable, inject, signal, NgZone } from '@angular/core';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';
import { Mensaje } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private supabase = inject(SupabaseService).getClient();
  private authService = inject(AuthService);
  private zone = inject(NgZone); // Para ejecutar código fuera de Angular y evitar que se quede esperando

  public mensajes = signal<Mensaje[]>([]);

  constructor() {
    this.cargarMensajesIniciales();
    this.escucharMensajesEnTiempoReal();
  }

  async cargarMensajesIniciales() {
    const { data } = await this.supabase
      .from('sala-chat') // <-- Cambiado al nombre de tu tabla
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) this.mensajes.set(data as Mensaje[]);
  }

  escucharMensajesEnTiempoReal() {
    this.supabase
      .channel('sala-publica')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala-chat' }, // <-- Cambiado al nombre de tu tabla
      () => { 
        // 3. Forzamos a que Angular ejecute esto de inmediato
        this.zone.run(() => {
          this.cargarMensajesIniciales(); 
        });
      })
      .subscribe();
  }

  async enviarMensaje(contenido: string) {
    const usuarioLogueado = this.authService.user(); 

    if (!usuarioLogueado) return;

    await this.supabase.from('sala-chat').insert({ // <-- Cambiado al nombre de tu tabla
      contenido: contenido,
      user_id: usuarioLogueado.id,
      nombre_usuario: usuarioLogueado.nombre // <-- Mapeado a la columna correcta de tu DB
    });
  }
}