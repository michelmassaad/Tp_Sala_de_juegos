import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { SesionUsuario, PerfilUsuario } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyectamos las herramientas que vamos a usar
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  // ==========================================
  // ESTADO DE LA SESIÓN (Nuestros "Megáfonos")
  // ==========================================
  
  // Guarda los datos del usuario activo o 'null' si no hay nadie.
  user = signal<SesionUsuario | null>(null);
  // 3. Un "atajo" para el HTML (opcional, para que quede más limpio)
  nombreUsuario = computed(() => this.user()?.email ?? 'Jugador');

  // Devuelve 'true' si hay alguien en 'user', o 'false' si es null.
  isAuthenticated = computed(() => this.user() !== null); 

  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');
  
  private cargarUsuario(supabaseUser: any) {
    const metadata = supabaseUser.user_metadata;
    
    this.user.set({
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      nombre: metadata?.nombre ?? 'Usuario',
      apellido: metadata?.apellido ?? '',
      edad: metadata?.edad ?? 0
    });
  }

  // Signal computado: Devuelve el correo del usuario logueado o la palabra 'Invitado'.
  // userEmail = computed(() => this.user()?.email ?? 'Invitado'); 

  constructor() {
    // Apenas arranca la app, nos fijamos si ya había alguien logueado de antes
    this.checkSession();

    // Este es un "vigilante" de Supabase. 
    // Si la sesión cambia por cualquier motivo (ej: se cierra desde otra pestaña), 
    // actualiza nuestro Signal automáticamente para que Angular se entere.
    this.supabase.getClient().auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.cargarUsuario(session.user); // Si hay sesión, cargamos los datos del usuario en el megáfono
      } else {
        this.user.set(null); // Si cerró sesión, vaciamos el megáfono
      }
    });
  }

  // Método para que la sesión sobreviva si el usuario aprieta F5 (recarga la página)
  async checkSession() {
    // Le preguntamos a Supabase si tiene una sesión guardada en la memoria del navegador
    const { data: { session } } = await this.supabase.getClient().auth.getSession();
    
    // Si la hay, restauramos los datos en nuestro Signal
    if (session?.user) {
        this.cargarUsuario(session.user); // Si hay sesión, cargamos los datos del usuario en el megáfono
    }
  }

  // ==========================================
  // MÉTODO 1: LOGIN (Estilo "Chaleco Antibalas")
  // ==========================================
  async login(email: string, password: string): Promise<boolean> {
    // Le mandamos las credenciales a Supabase y abrimos el paquete { data, error }
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({ email, password });

    // Si falló (contraseña incorrecta, mail no existe, etc.)
    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      // Devolvemos 'false' para que el componente muestre el mensaje de error visual,
      return false; 
    }

    // Si salió todo bien y Supabase nos devolvió el objeto 'user'
    if (data.user) {
      // 1. Avisamos por el megáfono que entró alguien
      this.cargarUsuario(data.user);
      return true;
    }

    return false; // Por si pasa algo muy raro y no hay ni error ni usuario
  }

  // =======================================================
  // MÉTODO 2: REGISTRO (Usando la técnica de la "Mochila")
  // =======================================================
  async registro(datosUsuario: PerfilUsuario, password: string): Promise<boolean> {
    
    // Llamamos a signUp enviando el correo y la clave obligatorios
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email: datosUsuario.correo,
      password: password,
      // En 'options.data' metemos nuestra "mochila" con todos los datos extra
      // Supabase los guardará automáticamente en su columna 'raw_user_meta_data'
      options: {
        data: {
          nombre: datosUsuario.nombre,
          apellido: datosUsuario.apellido,
          edad: datosUsuario.edad
        }
      }
    });
    
    // Si el registro falla (ej: el correo ya estaba usado)
    if (error) {
        this.errorMensaje.set(error.message);
      // Devolvemos false para que el componente actúe en consecuencia
      return false; 
    }

    // Si el registro fue exitoso
    if (data.user) {
      return true; // El usuario recién creado no se loguea solo, por eso no seteamos el megáfono ni redirigimos.
    }

    return false;
  }

  // ==========================================
  // MÉTODO 3: LOGOUT
  // ==========================================
  async logout(): Promise<void> {
    // Le decimos a Supabase que destruya la sesión en el servidor
    await this.supabase.getClient().auth.signOut();
    
    // Vaciamos nuestro Signal (ponemos a 'null' a nuestro vigilante)
    this.user.set(null);
    
    // Pateamos al usuario de vuelta a la pantalla de Login
    this.router.navigate(['/home']);
  }
}