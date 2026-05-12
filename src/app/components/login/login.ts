import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { timer } from 'rxjs/internal/observable/timer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-login',
  standalone: true, // Acordate que en Angular moderno usamos standalone
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);
  // Inyectamos nuestro servicio
  private authService = inject(AuthService);

  // ==========================================
  // ESTADO DEL FORMULARIO (Lo que el usuario tipea)
  // ==========================================
  email = '';
  password = '';

  // Ojito de password oculto para mostrar la contraseña en el formulario
  mostrarPassword = signal(false);
  habilitarPassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }

  // ==========================================
  // ESTADO DE LA INTERFAZ (Signals)
  // ==========================================
  // Controla si se muestra el spinner de "Cargando..."
  loading = signal(false);
  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');
  // Controla el mensaje de éxito verde que le mostramos al usuario
  mensajeExito = signal('');

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
    if (success) {
      this.loading.set(false);
      this.mensajeExito.set('Inicio de sesión exitoso! Bienvenido a tu Sala de Juegos...');
      
      // 3. Hacemos la pausa de 2 segundos para que el usuario disfrute su éxito
      await firstValueFrom(timer(2000));
      
      // 4. Recién ahora, ejecutamos el login (y el login sí nos lleva al /home)
      this.router.navigate(['/home']); // Redirigimos al usuario a la página principal.

    } else {
      this.errorMensaje.set('Credenciales incorrectas o usuario no registrado.');
      this.loading.set(false); // Desactivamos el spinner si falló.
    } 
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