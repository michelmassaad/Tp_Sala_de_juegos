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
      ruta: '/juegos/ahorcado',
      urlImagen: 'assets/ahorcado.png'
    },
    {
      nombre: 'Mayor o Menor',
      descripcion: 'Predecí si la próxima carta es mayor o menor que la actual.',
      ruta: '/juegos/mayor-menor',
      urlImagen: 'assets/mayor-menor.png'
    },
    {
      nombre: 'Preguntados',
      descripcion: 'Demostrá cuánto sabés respondiendo preguntas de cultura general.',
      ruta: '/juegos/preguntados',
      urlImagen: 'assets/preguntados.png'
    },
    {
      nombre: 'Bici Rush',
      descripcion: 'Esquivá obstáculos y llegá lo más lejos posible en esta carrera sin fin.',
      ruta: '/juegos/bici-rush',
      urlImagen: 'assets/bici-rush.png'
    }
  ];


}