import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultadosService } from '../../services/resultado';
import { DetallesPartida } from '../../models/models';
import { CronometroService } from '../../services/cronometro';


type Palo = '♠' | '♥' | '♦' | '♣';
interface Carta { 
  valor: number; 
  palo: Palo; 
  nombre: string;
 }

const PALOS: Palo[] = ['♠', '♥', '♦', '♣'];
const NOMBRES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const TOTAL_CARTAS = 10; // Partida de 10 rondas

// 🌟 ARQUITECTURA LIMPIA: Centralizamos solo las reglas de puntuación del juego
const CONFIG_PUNTAJE = {
  puntosPorAcierto: 10,
  bonusPorRacha: 5
};

function generarMazo(): Carta[] {
  const mazo: Carta[] = [];
  PALOS.forEach(palo => {
    NOMBRES.forEach((nombre, idx) => {
      mazo.push({ valor: idx + 1, palo, nombre });
    });
  });
  return mazo.sort(() => Math.random() - 0.5);
}

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  providers: [CronometroService],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor implements OnInit, OnDestroy {
  private resultadosService = inject(ResultadosService);
  private router = inject(Router);
  public cronometro = inject(CronometroService);

  readonly config = CONFIG_PUNTAJE;

  mazo = signal<Carta[]>([]);
  cartaActual = signal<Carta | null>(null);
  cartaSiguiente = signal<Carta | null>(null);

  acertadas = signal(0);
  rachaActual = signal(0);
  rachaMaxima = signal(0);
  ronda = signal(0);
  juegoTerminado = signal(false);
  guardando = signal(false);
  ultimoResultado = signal<'acierto' | 'fallo' | null>(null);
  mostrarSiguiente = signal(false);

  esRoja = (palo: Palo) => palo === '♥' || palo === '♦';

  puntaje = computed(() => {
    const base = this.acertadas() * this.config.puntosPorAcierto;
    const bonus = this.rachaMaxima() * this.config.bonusPorRacha;
    return base + bonus;
  });

  // Condición de victoria: acertar al menos la mitad de las rondas (5 o más)
  victoria = computed(() => this.acertadas() >= Math.ceil(TOTAL_CARTAS / 2));

  ngOnInit() {
    this.nuevaPartida();
  }

  ngOnDestroy() {
    this.cronometro.detenerCronometro();
  }

  nuevaPartida() {
    const mazo = generarMazo();
    this.mazo.set(mazo);
    this.cartaActual.set(mazo[0]);
    this.acertadas.set(0);
    this.rachaActual.set(0);
    this.rachaMaxima.set(0);
    this.ronda.set(1);
    this.juegoTerminado.set(false);
    this.guardando.set(false);
    this.ultimoResultado.set(null);
    this.mostrarSiguiente.set(false);

    this.cronometro.iniciarCronometro();
  }

  elegir(eleccion: 'mayor' | 'menor') {
    if (this.juegoTerminado() || this.guardando()) return;

    const actual = this.cartaActual();
    const mazo = this.mazo();
    const idx = this.ronda();

    // Si ya se llegó a la última carta, termina el juego
    if (!actual || idx >= mazo.length) return;

    const siguiente = mazo[idx];
    this.cartaSiguiente.set(siguiente);
    this.mostrarSiguiente.set(true);

    const esMayor = siguiente.valor > actual.valor;
    const acierto = (eleccion === 'mayor' && esMayor) || (eleccion === 'menor' && !esMayor);

    if (acierto) {
      this.acertadas.update(v => v + 1);
      this.rachaActual.update(v => v + 1);
      if (this.rachaActual() > this.rachaMaxima()) {
        this.rachaMaxima.set(this.rachaActual());
      }
      this.ultimoResultado.set('acierto');
    } else {
      this.rachaActual.set(0);
      this.ultimoResultado.set('fallo');
    }

    // Avanzar después de 1.2 segundos de forma automática
    setTimeout(async () => {
      this.cartaActual.set(siguiente);
      this.cartaSiguiente.set(null);
      this.mostrarSiguiente.set(false);
      this.ultimoResultado.set(null);
      this.ronda.update(v => v + 1);

      // Si es la última ronda, terminar el juego y guardar los resultados

      if (this.ronda() > TOTAL_CARTAS) {
        this.ronda.set(TOTAL_CARTAS);
        this.juegoTerminado.set(true);
        this.cronometro.detenerCronometro();
        // 🚀 DIRECTO A LA BASE DE DATOS: Guardamos al instante sin transacciones de monedas
        await this.guardarResultados();
      }
    }, 1200);
  }

  async guardarResultados() {
    this.guardando.set(true);

    const segundosJugados = this.cronometro.tiempoTranscurrido();


    const detallesExtras: DetallesPartida = {
      cartasAcertadas: this.acertadas(),
      rachaMaxima: this.rachaMaxima()
    };

    // Almacenamiento limpio en tu tabla de resultados
    await this.resultadosService.guardarResultado(
      'MAYOR_MENOR',
      this.puntaje(),
      this.victoria(),
      segundosJugados,
      detallesExtras
    );

    this.guardando.set(false);
  }

  volver() {
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}