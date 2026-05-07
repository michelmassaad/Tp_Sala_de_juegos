import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true, // Acordate que en Angular moderno usamos standalone
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  // Inyectamos nuestro servicio
  private authService = inject(AuthService);

  // ==========================================
  // ESTADO DEL FORMULARIO (Lo que el usuario tipea)
  // ==========================================
  email = '';
  password = '';

  // ==========================================
  // ESTADO DE LA INTERFAZ (Signals)
  // ==========================================
  // Controla si se muestra el spinner de "Cargando..."
  loading = signal(false);
  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');

  // ==========================================
  // REQUISITO DEL SPRINT 2: Accesos Rápidos
  // ==========================================
  // Estos son los 3 usuarios obligatorios para que el profe corrija rápido
  usuariosPrueba = [
    { email: 'jugador1@test.com', password: 'test123456', label: 'Jugador 1' },
    { email: 'jugador2@test.com', password: 'test123456', label: 'Jugador 2' },
    { email: 'jugador3@test.com', password: 'test123456', label: 'Jugador 3' },
  ];

  // ==========================================
  // MÉTODO PRINCIPAL: Cuando el usuario aprieta "Ingresar"
  // ==========================================
  async onSubmit() {
    // 1. Mini validación: No dejamos que mande el formulario vacío
    if (!this.email || !this.password) {
      this.errorMensaje.set('Por favor, completá todos los campos.');
      return; // Cortamos la ejecución acá mismo
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // 3. Llamamos al servicio (Fijate que ya no hay try...catch)
    // Nos va a devolver 'true' si entró, o 'false' si falló.
    const success = await this.authService.login(this.email, this.password);
    
    // 4. ¿Qué hacemos con la respuesta?
    if (!success) {
      this.errorMensaje.set('Credenciales incorrectas o usuario no registrado.');
      this.loading.set(false); // Desactivamos el spinner si falló.
    } 
    // Nota: Si success es true, no hacemos nada más. El AuthService 
    // ya se encarga de redirigirnos a la pantalla '/home' automáticamente.
  }

  // ==========================================
  // MÉTODO SECUNDARIO: Para los botones mágicos del profe
  // ==========================================
  loginRapido(correoRapido: string, passwordRapido: string) {
    // Cuando el profe hace clic en un botón, rellenamos las variables...
    this.email = correoRapido;
    this.password = passwordRapido;
    
    // ...y simulamos que se apretó el botón "Ingresar" del formulario
    this.onSubmit();
  }
}