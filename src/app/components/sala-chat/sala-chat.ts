import { Component, inject, ViewChild, ElementRef, effect} from '@angular/core';
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
export class SalaChatComponent {
  public chatService = inject(ChatService);
  public authService = inject(AuthService);
  nuevoMensaje = '';

  // 3. Recuperamos el control del Scroll
 @ViewChild('mensajesContainer') private scrollContainer!: ElementRef;

  // Asignamos el effect directamente a una variable privada.
  private scrollEffect = effect(() => { //
    const mensajes = this.chatService.mensajes(); 
    this.scrollToBottom();
  });

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 50);
    } catch(err) { }
  }

  enviar() {
    const texto = this.nuevoMensaje.trim();

    if (texto) {
      // 1. Vaciamos el input en el acto
      this.nuevoMensaje = ''; 
      // 2. Mandamos el mensaje de fondo, sin usar "await" para que Angular no se quede esperando
      this.chatService.enviarMensaje(texto);
    }
  }

  // Comprueba si el mensaje es del usuario actual para pintarlo cyan y a la derecha
  esMio(userId: string): boolean {
    return this.authService.user()?.id === userId;
  }

  // Paleta de colores vibrantes estilo E-sports (neón/pastel)
  private coloresUsuarios = [
    '#ff4757', '#2ed573', '#1e90ff', '#ffa502', 
    '#ff6348', '#7bed9f', '#70a1ff', '#eccc68', 
    '#ff7f50', '#00ced1', '#ff1493', '#adff2f'
  ];

  // Toma el nombre, lo convierte a un hash y le asigna un color fijo
  getColorUsuario(nombre: string): string {
    if (!nombre) return '#ffffff'; // Por si algún usuario no tiene nombre
    
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      // Magia oscura de bits para generar un número único basado en las letras
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Obtenemos un índice válido dentro del tamaño de nuestro array de colores
    const index = Math.abs(hash) % this.coloresUsuarios.length;
    return this.coloresUsuarios[index];
  }
}