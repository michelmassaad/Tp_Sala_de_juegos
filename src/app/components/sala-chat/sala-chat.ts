import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/sala-chat';
import { AuthService } from '../../services/auth';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sala-chat',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './sala-chat.html',
  styleUrl: './sala-chat.css'
})
export class ChatComponent {
  public chatService = inject(ChatService);
  public authService = inject(AuthService);
  nuevoMensaje = '';

  async enviar() {
    const texto = this.nuevoMensaje.trim();

    if (texto) {
      await this.chatService.enviarMensaje(texto);
      this.nuevoMensaje = ''; // Limpiamos el input
    }
  }
}