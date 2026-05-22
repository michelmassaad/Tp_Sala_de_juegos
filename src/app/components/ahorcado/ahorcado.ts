import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ResultadosService } from '../../services/resultado';
import { AuthService } from '../../services/auth';
import { DetallesPartida } from '../../models/models';

interface PalabraJuego {
  palabra: string;
  categoria: 'FÚTBOL' | 'VIDEOJUEGOS' | 'PELÍCULAS' | 'MÚSICA';
  pista: string;
}

const BANCO_PALABRAS: PalabraJuego[] = [
  { palabra: 'MESSI',     categoria: 'FÚTBOL', pista: 'El mejor jugador del mundo, capitán de la Selección Argentina.' },
  { palabra: 'ARQUERO',   categoria: 'FÚTBOL', pista: 'El único jugador del equipo que puede usar las manos en el área.' },
  { palabra: 'PELOTA',    categoria: 'FÚTBOL', pista: 'El objeto sagrado que hay que meter adentro del arco.' },
  { palabra: 'GOLAZO',    categoria: 'FÚTBOL', pista: 'Cuando la clavás al ángulo y todo el estadio se viene abajo.' },
  { palabra: 'JOYSTICK',  categoria: 'VIDEOJUEGOS', pista: 'El control con botones que usás en tus manos para jugar.' },
  { palabra: 'CONSOLA',   categoria: 'VIDEOJUEGOS', pista: 'La máquina que conectás a la tele para viciar tus juegos favoritos.' },
  { palabra: 'MINECRAFT', categoria: 'VIDEOJUEGOS', pista: 'El juego de cubos infinitos donde picás piedra y construís casas.' },
  { palabra: 'FORTNITE',  categoria: 'VIDEOJUEGOS', pista: 'El Battle Royale donde caes de un colectivo volador y construís rampas.' },
  { palabra: 'AVATAR',    categoria: 'PELÍCULAS', pista: 'Peli donde viajan a un planeta de alienígenas azules gigantes.' },
  { palabra: 'POPCORN',   categoria: 'PELÍCULAS', pista: 'El balde de pochoclos salados o dulces que no puede faltar en el cine.' },
  { palabra: 'TITANIC',   categoria: 'PELÍCULAS', pista: 'Historia del barco gigante que choca contra un bloque de hielo.' },
  { palabra: 'GUITARRA',  categoria: 'MÚSICA', pista: 'Instrumento de seis cuerdas ideal para tocar rock and roll.' },
  { palabra: 'BATERIA',   categoria: 'MÚSICA', pista: 'Instrumento de percusión con platillos que lleva el ritmo a puro golpe.' },
  { palabra: 'PIANO',     categoria: 'MÚSICA', pista: 'Instrumento clásico que tiene teclas blancas y negras.' }
];

const MAX_INTENTOS = 6;
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 🌟 ARQUITECTURA LIMPIA: Centralizamos toda la economía y puntajes en un solo lugar
const CONFIG_ECONOMIA = {
  costoPista: 50,
  costoBomba: 40,
  premioVictoria: 80,
  puntosPorAcierto: 10,
  puntosPorError: 5
};


// 1. Definimos la interfaz afuera (junto a PalabraJuego)
interface CategoriaJuego {
  id: 'FÚTBOL' | 'VIDEOJUEGOS' | 'PELÍCULAS' | 'MÚSICA';
  nombre: string;
  badge: string;
  emoji: string;
  descripcion: string;
}

// 2. Definimos el banco de datos estático afuera (como hiciste con BANCO_PALABRAS)
const BANCO_CATEGORIAS: CategoriaJuego[] = [
  {
    id: 'FÚTBOL',
    nombre: 'FÚTBOL',
    badge: 'SPORTS',
    emoji: '⚽',
    descripcion: 'Poné a prueba tus conocimientos sobre el deporte rey.'
  },
  {
    id: 'VIDEOJUEGOS',
    nombre: 'VIDEOJUEGOS',
    badge: 'GAMES',
    emoji: '🎮',
    descripcion: '¿Gamer de pura cepa? Demostralo descifrando títulos.'
  },
  {
    id: 'PELÍCULAS',
    nombre: 'PELÍCULAS',
    badge: 'CINEMA',
    emoji: '🎬',
    descripcion: 'Cine clásico, directores y tanques de Hollywood.'
  },
  {
    id: 'MÚSICA',
    nombre: 'MÚSICA',
    badge: 'MUSIC',
    emoji: '🎵',
    descripcion: 'Bandas históricas, solistas e instrumentos ocultos.'
  }
];

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.css']
})
export class AhorcadoComponent implements OnInit, OnDestroy { 
  private router = inject(Router);
  private auth = inject(AuthService); 
  private resultadosService = inject(ResultadosService); 
  
  readonly categorias = BANCO_CATEGORIAS;
  // Exponemos la configuración para poder leerla desde el HTML
  readonly config = CONFIG_ECONOMIA;

  public imagenesAhorcado = [
    '/ahorcado-0.png', '/ahorcado-1.png', '/ahorcado-2.png',
    '/ahorcado-3.png', '/ahorcado-4.png', '/ahorcado-5.png', '/ahorcado-6.png'
  ];

  readonly letras = LETRAS;

  juegoIniciado = signal(false); 
  categoriaActual = signal<string>('');

  palabraActual  = signal<PalabraJuego | null>(null);
  letrasUsadas   = signal<Set<string>>(new Set());
  letrasEliminadasPorBomba = signal<Set<string>>(new Set());
  
  juegoTerminado = signal(false);
  guardando      = signal(false); 
  
  rachaVictorias = signal(0);
  nivelActual    = signal(1); 
  errorDetectado = signal(false);
  
  monedas = computed(() => this.auth.user()?.monedas ?? 0); 
  
  oraculoUsado   = signal(false); 
  bombaUsada     = signal(false);

  // ⏱️ CRONÓMETRO VISUAL E INTERNO
  private tiempoInicio: number = 0;
  private intervaloTimer: any; 
  tiempoTranscurrido = signal(0); 
  
  tiempoFormateado = computed(() => {
    const totalSegundos = this.tiempoTranscurrido();
    const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  });

  get palabraStr(): string { return this.palabraActual()?.palabra ?? ''; }

  letrasAdivinadas = computed(() => this.palabraStr.split('').filter(l => this.letrasUsadas().has(l)));
  intentosRestantes = computed(() => {
    const incorrectas = [...this.letrasUsadas()].filter(l => !this.palabraStr.includes(l));
    return MAX_INTENTOS - incorrectas.length;
  });
  letrasIncorrectas = computed(() => [...this.letrasUsadas()].filter(l => !this.palabraStr.includes(l)));
  palabraMostrada = computed(() => this.palabraStr.split('').map(l => this.letrasUsadas().has(l) ? l : '_').join(' '));
  victoria = computed(() => this.palabraStr.length > 0 && this.palabraStr.split('').every(l => this.letrasUsadas().has(l)));
  derrota = computed(() => this.intentosRestantes() <= 0);
  partesMostradas = computed(() => MAX_INTENTOS - this.intentosRestantes());
  letrasRestantes = computed(() => this.palabraStr.split('').filter(l => !this.letrasUsadas().has(l)).length);

  ngOnInit() {}

  ngOnDestroy() {
    this.detenerCronometro();
  }

  seleccionarCategoria(cat: 'FÚTBOL' | 'VIDEOJUEGOS' | 'PELÍCULAS' | 'MÚSICA') {
    this.categoriaActual.set(cat);
    this.juegoIniciado.set(true);
    this.rachaVictorias.set(0);
    this.nivelActual.set(1);
    this.lanzarNuevaPalabra();
  }

  lanzarNuevaPalabra() {
    const filtradas = BANCO_PALABRAS.filter(p => p.categoria === this.categoriaActual());
    const idx = Math.floor(Math.random() * filtradas.length);
    
    this.palabraActual.set(filtradas[idx]);
    this.letrasUsadas.set(new Set());
    this.letrasEliminadasPorBomba.set(new Set()); 
    this.juegoTerminado.set(false);
    this.guardando.set(false);
    this.errorDetectado.set(false);
    this.oraculoUsado.set(false);
    this.bombaUsada.set(false);

    this.iniciarCronometro(); 
  }

  iniciarCronometro() {
    this.detenerCronometro(); 
    this.tiempoTranscurrido.set(0);
    this.tiempoInicio = Date.now();
    
    this.intervaloTimer = setInterval(() => {
      this.tiempoTranscurrido.update(t => t + 1);
    }, 1000);
  }

  detenerCronometro() {
    if (this.intervaloTimer) {
      clearInterval(this.intervaloTimer);
    }
  }

  elegirLetra(letra: string) {
    if (this.juegoTerminado() || this.guardando()) return;
    if (this.letrasUsadas().has(letra) || this.letrasEliminadasPorBomba().has(letra)) return;

    if (!this.palabraStr.includes(letra)) {
      this.errorDetectado.set(true);
      setTimeout(() => this.errorDetectado.set(false), 400);
    }

    this.letrasUsadas.update(set => new Set([...set, letra]));
    this.chequearFinal();
  }

  async comprarPista() {
    if (this.juegoTerminado() || this.guardando() || this.oraculoUsado() || this.monedas() < this.config.costoPista || this.letrasRestantes() <= 0) return;

    const faltantes = this.palabraStr.split('').filter(l => !this.letrasUsadas().has(l));
    if (faltantes.length > 0) {
      const letraRandom = faltantes[Math.floor(Math.random() * faltantes.length)];
      
      // 🌟 Usamos la variable de configuración en lugar del número hardcodeado
      await this.auth.actualizarMonedas(-this.config.costoPista);
      this.oraculoUsado.set(true);
      
      this.letrasUsadas.update(set => new Set([...set, letraRandom]));
      this.chequearFinal();
    }
  }

  async comprarBomba() {
    if (this.juegoTerminado() || this.guardando() || this.bombaUsada() || this.monedas() < this.config.costoBomba) return;

    const incorrectasDisponibles = this.letras.filter(
      l => !this.palabraStr.includes(l) && 
           !this.letrasUsadas().has(l) && 
           !this.letrasEliminadasPorBomba().has(l)
    );

    if (incorrectasDisponibles.length > 0) {
      const seleccionadas = incorrectasDisponibles.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // 🌟 Usamos la variable de configuración
      await this.auth.actualizarMonedas(-this.config.costoBomba);
      this.bombaUsada.set(true);

      this.letrasEliminadasPorBomba.update(set => {
        const nuevoSet = new Set(set);
        seleccionadas.forEach(l => nuevoSet.add(l));
        return nuevoSet;
      });
    }
  }

  private async chequearFinal() {
    if (this.victoria()) {
      this.detenerCronometro(); 
      this.rachaVictorias.update(r => r + 1);
      this.nivelActual.update(n => n + 1);
      
      // 🌟 Usamos la recompensa desde la configuración
      await this.auth.actualizarMonedas(this.config.premioVictoria);
      this.juegoTerminado.set(true);
      await this.guardarResultado();
    } else if (this.derrota()) {
      this.detenerCronometro(); 
      this.juegoTerminado.set(true);
      await this.guardarResultado();
    }
  }

  async guardarResultado() {
    this.guardando.set(true);

    const correctas = this.letrasAdivinadas().length;
    const incorrectas = this.letrasIncorrectas().length;
    
    // 🌟 Centralizamos también la fórmula de puntos
    const puntaje = Math.max(0, (correctas * this.config.puntosPorAcierto) - (incorrectas * this.config.puntosPorError));

    const segundosJugados = Math.round((Date.now() - this.tiempoInicio) / 1000);

    const detallesExtras: DetallesPartida = {
      palabra: this.palabraStr,
      letrasSeleccionadas: this.letrasUsadas().size + this.letrasEliminadasPorBomba().size,
      errores: incorrectas
    };

    await this.resultadosService.guardarResultado(
      'AHORCADO',
      puntaje,
      this.victoria(),
      segundosJugados,
      detallesExtras
    );

    this.guardando.set(false);
  }

  irAlMenu() {
    this.detenerCronometro(); 
    this.juegoIniciado.set(false);
    this.juegoTerminado.set(false);
  }

  yaUsada(letra: string): boolean { 
    return this.letrasUsadas().has(letra) || this.letrasEliminadasPorBomba().has(letra); 
  }
  
  esCorrecta(letra: string): boolean { return this.palabraStr.includes(letra); }
  volver() { this.router.navigate(['/home']); }
}