import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { timer } from 'rxjs/internal/observable/timer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {

  // Inyectamos nuestro servicio
  private authService = inject(AuthService);

  // ==========================================
  // ESTADO DEL FORMULARIO (Lo que el usuario tipea)
  // ==========================================
  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;


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
  // MÉTODO PRINCIPAL: Cuando el usuario aprieta "Ingresar"
  // ==========================================
  async onSubmit() {
    // 1. Mini validación: No dejamos que mande el formulario vacío
    if (!this.email || !this.password || !this.nombre || !this.apellido || this.edad === null) {
      this.errorMensaje.set('Por favor, completá todos los campos.');
      return; // Cortamos la ejecución acá mismo
    }

    // 2. Validación de la edad: Aseguramos que sea un número entre 1 y 120
    if (!this.edad || this.edad < 1 || this.edad > 120) {
      this.errorMensaje.set('Ingresá una edad válida.');
      return;
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // 3. Llamamos al servicio (Fijate que ya no hay try...catch)
    // Nos va a devolver 'true' si entró, o 'false' si falló.
    const success = await this.authService.registro(
      {
        correo: this.email,
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
      }, this.password);

    // 4. ¿Qué hacemos con la respuesta?
    if (success) {
      // 2. ¡ÉXITO! Apagamos el spinner rojo de error y mostramos la alerta verde
      this.loading.set(false);
      this.mensajeExito.set('¡Registro exitoso! Preparando tu Sala de Juegos...');

      // 3. Hacemos la pausa de 2 segundos para que el usuario disfrute su éxito
      await firstValueFrom(timer(2000));

      // 4. Recién ahora, ejecutamos el login (y el login sí nos lleva al /home)
      await this.authService.login(this.email, this.password);
      
    } else {
      // 5. Si falló, mostramos el error y apagamos el spinner
      this.errorMensaje.set('Error al registrarse. El correo ya está en uso o es inválido.');
      this.loading.set(false); 
    }
  }


}
