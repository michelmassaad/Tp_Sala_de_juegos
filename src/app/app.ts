import { Component, inject, signal, effect } from '@angular/core'; // <-- 1. Agregamos effect
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthService } from './services/auth';
import { SalaChatComponent } from './components/sala-chat/sala-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, SalaChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Tp_Sala_de_juegos');

  authService = inject(AuthService);
  chatAbierto = signal(false);

  // 2. Agregamos el constructor con el effect
  constructor() {
    effect(() => {
      // Si el usuario deja de estar autenticado (cierra sesión)...
      if (!this.authService.isAuthenticated()) {
        this.chatAbierto.set(false); // ...forzamos el cierre del chat
      }
    });
  }

  toggleChat() {
    this.chatAbierto.set(!this.chatAbierto());
  }
}