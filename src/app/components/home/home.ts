import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

  public authService = inject(AuthService);

  // 2. Definimos el arreglo de juegos que pide tu grilla del HTML
  juegos = [
    {
      nombre: 'Ahorcado',
      descripcion: 'Juego para adivinar una palabra oculta por letras.',
      ruta: '/home/ahorcado',
      urlImagen: '/ahorcado/ahorcado.png'
    },
    {
      nombre: 'Mayor o Menor',
      descripcion: 'Predecí si la próxima carta es mayor o menor que la actual.',
      ruta: '/home/mayor-menor',
      urlImagen: 'mayor-menor.png'
    },
    {
      nombre: 'Preguntados',
      descripcion: 'Demostrá cuánto sabés respondiendo preguntas de cultura general.',
      ruta: '/home/preguntados',
      urlImagen: 'preguntados.png'
    },
    {
      nombre: 'Bici Rush',
      descripcion: 'Esquivá obstáculos y llegá lo más lejos posible en esta carrera sin fin.',
      ruta: '/home/bici-rush',
      urlImagen: 'bici-rush.png'
    }
  ];


}