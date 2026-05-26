import { Component, inject, ViewChild, ElementRef, effect } from '@angular/core';
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

  // Recuperamos el control del contenedor del scroll
  @ViewChild('mensajesContainer') private scrollContainer!: ElementRef;

  // Este effect se disparará únicamente cuando la lista de mensajes mute en memoria
  private scrollEffect = effect(() => {
    this.chatService.mensajes(); // Dependencia reactiva aislada
    this.scrollToBottom();
  });

  // Método para hacer scroll al final del contenedor de mensajes
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 0);
    } catch(err) { }
  }

  async enviar() {
    const texto = this.nuevoMensaje.trim();

    if (texto) {
      // Guardamos el texto temporalmente por si falla la red
      const textoTemporal = this.nuevoMensaje;
      this.nuevoMensaje = ''; 

      // Esperamos a ver si el servicio lo pudo mandar a Supabase
      const enviadoCorrectamente = await this.chatService.enviarMensaje(texto);
      
      // Si falló la conexión, le devolvemos el texto al input para que no pierda lo escrito
      if (!enviadoCorrectamente) {
        this.nuevoMensaje = textoTemporal;
      }
    }
  }

  // Comprueba si el mensaje es del usuario actual para alinearlo a la derecha
  esMio(userId: string): boolean {
    return this.authService.user()?.id === userId;
  }

  // Paleta de colores vibrantes estilo E-sports (neón/pastel)
  private coloresUsuarios = [
    '#ff4757', '#2ed573', '#1e90ff', '#ffa502', 
    '#ff6348', '#7bed9f', '#70a1ff', '#eccc68', 
    '#ff7f50', '#00ced1', '#ff1493', '#adff2f'
  ];

  // Toma el nombre, lo convierte a un hash matemático y le asigna un color fijo por usuario
  getColorUsuario(nombre: string): string {
    if (!nombre) return '#ffffff';
    
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % this.coloresUsuarios.length;
    return this.coloresUsuarios[index];
  }
}