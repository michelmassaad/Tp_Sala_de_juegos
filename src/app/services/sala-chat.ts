import { Injectable, inject, signal, NgZone } from '@angular/core';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';
import { Mensaje } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private supabase = inject(SupabaseService).getClient();
  private authService = inject(AuthService);
  private zone = inject(NgZone); 

  public mensajes = signal<Mensaje[]>([]);

  constructor() {
    this.cargarMensajesIniciales();
    this.escucharMensajesEnTiempoReal();
  }

  async cargarMensajesIniciales() {
    const { data } = await this.supabase
      .from('sala-chat')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) this.mensajes.set(data as Mensaje[]);
  }

  escucharMensajesEnTiempoReal() {
    this.supabase
      .channel('sala-publica')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala-chat' }, 
      (payload) => { 
        // Forzamos la sincronización inmediata con la zona de Angular
        this.zone.run(() => {
          // Extraemos el mensaje recién insertado y confirmado por la DB
          const nuevoMensaje = payload.new as Mensaje;
          
          // Lo agregamos al final del Signal en milisegundos sin volver a descargar todo
          this.mensajes.update(listaActual => [...listaActual, nuevoMensaje]);
        });
      })
      .subscribe();
  }

  async enviarMensaje(contenido: string): Promise<boolean> {
    const usuarioLogueado = this.authService.user(); 
    if (!usuarioLogueado) return false;

    try {
      const { error } = await this.supabase.from('sala-chat').insert({ 
        contenido: contenido,
        user_id: usuarioLogueado.id,
        nombre_usuario: usuarioLogueado.nombre 
      });

      if (error) throw error;
      return true;

    } catch (err) {
      console.error("Error transaccional de red:", err);
      // alert("No se pudo enviar el mensaje. Revisá tu conexión a internet.");
      return false;
    }
  }
}