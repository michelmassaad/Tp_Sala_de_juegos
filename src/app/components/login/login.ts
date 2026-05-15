import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'; // <-- Cambiamos FormsModule por ReactiveFormsModule
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { timer } from 'rxjs/internal/observable/timer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // <-- Importante: ReactiveFormsModule
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder); // <-- Inyectamos el FormBuilder

  // ==========================================
  // ESTADO DEL FORMULARIO (Reactive Forms)
  // ==========================================
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Ojito de password oculto
  mostrarPassword = signal(false);
  habilitarPassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }

  // ==========================================
  // ESTADO DE LA INTERFAZ (Signals)
  // ==========================================
  loading = signal(false);
  errorMensaje = signal('');
  mensajeExito = signal('');

  // ==========================================
  // REQUISITO DEL SPRINT 2: Accesos Rápidos
  // ==========================================
usuariosPrueba = [
    { email: 'tester1@test.com', password: 'PruebaUTN2026!', label: 'Tester Alfa' },
    { email: 'tester2@test.com', password: 'PruebaUTN2026!', label: 'Tester Beta' },
    { email: 'tester3@test.com', password: 'PruebaUTN2026!', label: 'Tester Gamma' },
  ];

  // ==========================================
  // MÉTODO PRINCIPAL: Cuando el usuario aprieta "Ingresar"
  // ==========================================
  async onSubmit() {
    // 1. Mini validación del formulario reactivo
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca los campos en rojo si están vacíos o mal
      this.errorMensaje.set('Por favor, completá los campos correctamente.');
      return; 
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // Extraemos los valores ya validados del formulario
    const { email , password } = this.loginForm.getRawValue(); // getRawValue() nos da los valores actuales del formulario

    // 3. Llamamos al servicio con los valores (le ponemos '!' porque TypeScript sabe que no son nulos gracias al validador)
    const success = await this.authService.login(email, password);
    
    // 4. ¿Qué hacemos con la respuesta?
    if (success) {
        await firstValueFrom(timer(1000));

      this.mensajeExito.set('Inicio de sesión exitoso! Bienvenido a tu Sala de Juegos...');
      
      // Hacemos la pausa de 1.5 segundos para que el usuario disfrute su éxito
      await firstValueFrom(timer(1500));
      this.loading.set(false);
      
      // Redirigimos al usuario a la página principal.
      this.router.navigate(['/home']); 

    } else {
      // Tomamos el error que viene de Supabase (si lo guardaste en tu servicio) o uno genérico
      this.errorMensaje.set(this.authService.errorMensaje() || 'Credenciales incorrectas o usuario no registrado.');
      this.loading.set(false); 
    } 
  }

  // ==========================================
  // MÉTODO SECUNDARIO: Para los botones mágicos del profe
  // ==========================================
  loginRapido(correoRapido: string, passwordRapido: string) {
    // En Reactive Forms, usamos patchValue para rellenar los inputs desde código
    this.loginForm.patchValue({
      email: correoRapido,
      password: passwordRapido
    });
    
    // Simulamos que se apretó el botón "Ingresar"
    // this.onSubmit();
  }
}