import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultadosService } from '../../services/resultado';
import { ResultadoPartida } from '../../models/models';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {
  private registrosService = inject(ResultadosService);
  private router = inject(Router);

  // Acá guardo la lista completa que viene pura de la base de datos
  historialCompleto = signal<ResultadoPartida[]>([]);
  cargando = signal(false);

  // NOTA MENTAL: Uso computed para filtrar por juego y ordenar de mejor a peor desempeño
  
  resultadosAhorcado = computed(() => {
    return this.historialCompleto()
      .filter(r => r.juego === 'AHORCADO')
      .sort((a, b) => b.puntaje - a.puntaje)// Mayor puntaje primero
      .slice(0, 10); // 🚀 Recorta y se queda solo con los primeros 10
  });

  resultadosMayorMenor = computed(() => {
    return this.historialCompleto()
      .filter(r => r.juego === 'MAYOR_MENOR')
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 10); // 🚀 Recorta y se queda solo con los primeros 10
  });

  resultadosPreguntados = computed(() => {
    return this.historialCompleto()
      .filter(r => r.juego === 'PREGUNTADOS')
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 10); // 🚀 Recorta y se queda solo con los primeros 10
  });

  // En este juego el mejor desempeño se mide por quién lo hizo en menos tiempo
  resultadosBiciRush = computed(() => {
    return this.historialCompleto()
      .filter(r => r.juego === 'BICI_RUSH')
      .sort((a, b) => b.puntaje - a.puntaje)// mayor puntaje primero
      .slice(0, 10); // 🚀 Recorta y se queda solo con los primeros 10
  });

  ngOnInit() {
    this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    this.cargando.set(true);
    try {
      // Llamo al método del servicio 
      const datos = await this.registrosService.rankings();
      this.historialCompleto.set(datos || []);
    } catch (error) {
      console.error('Error al traer los rankings:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Función para dar formato amigable a los segundos de la tabla (ej: 0:45)
  formatearTiempo(totalSegundos: number): string {
    const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  }

  volver() {
    this.router.navigate(['/home']);
  }
}