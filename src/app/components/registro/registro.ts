import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { timer } from 'rxjs/internal/observable/timer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], 
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder); 

  // ==========================================
  // CEREBRO DEL FORMULARIO REACTIVO
  // ==========================================
  registroForm = this.fb.nonNullable.group({
    // Aplicamos los validadores nativos + el nuestro custom
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40), soloLetrasValidator()]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40), soloLetrasValidator()]],
    // Usamos 'null' inicial para que la caja aparezca vacía, pero le exigimos rango
    edad: [null as unknown as number, [Validators.required, Validators.min(1), Validators.max(120)]], 
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
  // MÉTODO PRINCIPAL
  // ==========================================
  async onSubmit() {
    // 1. Mini validación usando el Formulario Reactivo
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); 
      this.errorMensaje.set('Por favor, completá todos los campos correctamente.');
      return; 
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // 3. Extraemos todos los valores ya validados por nuestro TS
    const formValues = this.registroForm.getRawValue();

    // 4. Llamamos al servicio de registro
    const success = await this.authService.registro(
      {
        correo: formValues.email,
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        edad: formValues.edad,
      }, 
      formValues.password
    );

    // 5. Manejo de la respuesta
    if (success) {
      await firstValueFrom(timer(1000));
      this.mensajeExito.set('¡Registro exitoso! Preparando tu Sala de Juegos...');
      
      await firstValueFrom(timer(1500));
      
      // Auto-Login
      await this.authService.login(formValues.email, formValues.password);
      
      this.loading.set(false);
      this.router.navigate(['/home']);
      
    } else {
      this.errorMensaje.set(this.authService.errorMensaje() || 'Error al registrarse. El correo ya está en uso o es inválido.');
      this.loading.set(false); 
    }
  }
}

// ==========================================
// VALIDADOR CUSTOM: La bóveda de seguridad
// ==========================================
export function soloLetrasValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) return null; // Si está vacío, lo ataja el Validators.required
    
    // Solo acepta letras (incluyendo acentos y ñ) y espacios
    const esValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
    
    // Si no pasa la prueba, dispara el error 'soloLetras'
    return !esValido ? { soloLetras: true } : null;
  };
}