import {
  Component, inject, signal, computed, OnInit, OnDestroy,
  ViewChild, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultadosService } from '../../services/resultado';
import { CronometroService } from '../../services/cronometro';
import { AuthService } from '../../services/auth';
import { DetallesPartida } from '../../models/models';

@Component({
  selector: 'app-bici-rush',
  standalone: true,
  imports: [CommonModule],
  providers: [CronometroService],
  templateUrl: './bici-rush.html',
  styleUrl: './bici-rush.css'
})
export class BiciRush implements OnInit, OnDestroy {
  // ── INYECCIÓN DE SERVICIOS ────────────────────────────────────────────────
  private resultadosService = inject(ResultadosService);
  private auth            = inject(AuthService);
  private router           = inject(Router);
  public  cronometro     = inject(CronometroService);

  // ── REFERENCIAS AL DOM Y RENDERIZADO ──────────────────────────────────────
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;

  // ── CONSTANTES DE CONFIGURACIÓN DEL JUEGO (NUNCA MÁS HARCODEADO) ──────────
  // Dimensiones del Canvas de Juego
  private readonly CANVAS_WIDTH = 1000;
  private readonly CANVAS_HEIGHT = 450;
  
  // Control de Escenario de Montaña
  private readonly ANGULO_INCLINACION = -0.05; // ~-3 grados de pendiente (ajustable)

  // Condición de Victoria e Incrementos del Loop Princial
  private readonly METROS_VICTORIA = 2000;
  private readonly INCREMENTO_METROS = 0.35;
  // Parámetros de Premiación
  private readonly BONO_VICTORIA_MONEDAS = 50; // Cantidad de monedas extra de regalo al ganar
  private readonly VALOR_MONEDA = 5; // Cada moneda dorada recolectada ahora vale 5 en vez de 1
  
  // Control de Velocidad y Sistema de Dificultad Progresiva
  private readonly VELOCIDAD_INICIAL = 10.5;
  private readonly VELOCIDAD_MAXIMA = 22;
  private readonly CHECKPOINT_DISTANCIA = 300; // Cada cuántos metros aumenta la velocidad
  private readonly INCREMENTO_VELOCIDAD = 0.8;  // Cuánto aumenta la velocidad por checkpoint
  private readonly MULTIPLICADOR_PARALLAX = 0.2;
  private readonly MULTIPLICADOR_PISO = 4;

  // Parámetros Físicos del Ciclista
  private readonly SUELO_Y = 320;         // Altura base donde descansa la bicicleta
  private readonly GRAVEDAD = 0.75;       // Fuerza de aceleración hacia abajo
  private readonly IMPULSO_SALTO = -14.5; // Fuerza inicial del salto (Eje Y invertido)

  // Dimensiones de Render y Cuadro de Colisión (AABB) del Ciclista
  private readonly CICLISTA_RENDER_X = 130;
  private readonly CICLISTA_OFFSET_Y = 85;
  private readonly CICLISTA_ANCHO = 125;
  private readonly CICLISTA_ALTO = 125;
  private readonly CICLISTA_COLL_OFFSET_X = 5;  // Ajuste interno horizontal de colisión
  private readonly CICLISTA_COLL_ANCHO = 60;     // Ancho real del cuerpo + ruedas (195 - 135)
  private readonly CICLISTA_COLL_ALTO = 85;      // Alto real del ciclista desde su base

  // Parámetros del Ciclista Auxiliar (Fallback)
  private readonly FALLBACK_OFFSET_X = 10;
  private readonly FALLBACK_OFFSET_Y = 70;
  private readonly FALLBACK_ANCHO = 50;
  private readonly FALLBACK_ALTO = 70;

  // Dimensiones de Render y Cuadro de Colisión (AABB) de Obstáculos
  private readonly OBSTACULO_ANCHO = 75;
  private readonly OBSTACULO_ALTO = 75;
  private readonly OBSTACULO_OFFSET_Y = 35;
  private readonly OBSTACULO_COLL_OFFSET_X = 6;  // Margen interno izquierdo de colisión
  private readonly OBSTACULO_COLL_ANCHO = 33;    // Ancho real calibrado (39 - 6)
  private readonly OBSTACULO_COLL_ALTO = 38;     // Alto real del objeto desde el piso
  private readonly OBSTACULO_INICIAL_X = 1100;
  private readonly OBSTACULO_SPAWN_X_BASE = 1050;
  private readonly OBSTACULO_SPAWN_X_RANDOM = 450;
  private readonly OBSTACULO_LIMIT_IZQ = -60;

  // Parámetros de Generación y Colisión de Monedas
  private readonly MONEDA_CHANCE_SPAWN = 0.012;   // Probabilidad de aparición por frame
  private readonly MONEDA_MIN_X_SPAWN = 400;      // Distancia mínima requerida del obstáculo
  private readonly MONEDA_SPAWN_X = 1050;
  private readonly MONEDA_ALTURA_BAJA_Y = 20;     // Distancia desde el suelo (Moneda Baja)
  private readonly MONEDA_ALTURA_ALTA_Y = 95;     // Distancia desde el suelo (Moneda Alta)
  private readonly MONEDA_INCREMENTO_ANIM = 0.15; // Velocidad del efecto de brillo/pulsación
  private readonly MONEDA_RADIO_EFECTO = 12;
  private readonly MONEDA_RADIO_MINIMO = 4;
  private readonly MONEDA_CENTRO_OFFSET = 12;
  private readonly MONEDA_LIMIT_IZQ = -40;

  // Umbrales de Colisión Circular/Centroide para Captura de Monedas
  private readonly MONEDA_PLAYER_CENTRO_X = 175;
  private readonly MONEDA_PLAYER_CENTRO_Y_OFFSET = 40;
  private readonly MONEDA_DIST_MAX_X = 45;
  private readonly MONEDA_DIST_MAX_Y = 55;


  // Tiempos y Animación
  private readonly TIEMPO_REVIVIR_MAX = 10;
  private readonly VELOCIDAD_ANIM_CICLISTA = 5;

  // ── SIGNALS DE ESTADO Y LIMBO ────────────────────────────────────────────
  metros            = signal(0);
  juegoCorriendo    = signal(false);
  juegoTerminado    = signal(false);
  esperandoRevivir  = signal(false); 
  victoria          = signal(false);
  guardando          = signal(false);
  monedasPartida    = signal(0); 

  // ── SISTEMA DE REVIVIR CON CUENTA REGRESIVA ──────────────────────────────
  costoRevivir          = 50;
  yaRevivio               = signal(false);
  mostrarBotonRevivir   = signal(false);
  monedasUsuario        = computed(() => this.auth.user()?.monedas ?? 0);
  
  tiempoParaRevivir     = signal(this.TIEMPO_REVIVIR_MAX); 
  private revivirIntervalId: any = null;
  private tiempoGuardadoPrevio = 0; // Almacena el tiempo acumulado antes de morir

  // ── ASSETS GRÁFICOS ──────────────────────────────────────────────────────
  private imgObstaculoRoca   = new Image();
  private imgObstaculoTronco = new Image();
  private imgFondoParallax   = new Image();
  private spritesPedaleo: HTMLImageElement[] = [];
  private spriteSalto        = new Image();
  private imgPisoSendero = new Image();

  // ── ANIMACIÓN POR FRAMES ─────────────────────────────────────────────────
  private frameContador      = 0;
  private velocidadAnimacion = this.VELOCIDAD_ANIM_CICLISTA; 

  // ── CONFIGURACIÓN DINÁMICA DE ENTIDADES ──────────────────────────────────
  private ciclistaY          = this.SUELO_Y;  
  private ciclistaVelY       = 0;
  private estaSaltando       = false;

  private obstaculoX           = this.OBSTACULO_INICIAL_X;
  private tipoObstaculoActual: 'roca' | 'tronco' = 'roca';
  private velocidadEscena      = this.VELOCIDAD_INICIAL; 
  private metrosInternos       = 0;
  private fondoLejosX          = 0;
  private ultimoCheckpointVelocidad = 0;

  // ── VARIABLES DE MONEDAS ─────────────────────────────────────────────────
  private coinX = this.MONEDA_LIMIT_IZQ;
  private coinY = 0;
  private coinActiva = false;
  private animacionMoneda = 0;

  // ── ESCUCHA DE TECLADO ───────────────────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  manejarTeclado(e: KeyboardEvent) {
    if (e.code === 'Space') { 
      e.preventDefault(); 
      this.saltar(); 
    }
  }

  // ── LIFECYCLE HOOKS ──────────────────────────────────────────────────────
  ngOnInit() {
    // Inicialización y carga de assets multimedia desde el directorio público
    this.imgObstaculoRoca.src   = '/bici-rush/obstacle_rock.png';
    this.imgObstaculoTronco.src = '/bici-rush/obstacle_log.png';
    this.imgFondoParallax.src   = '/bici-rush/paisaje.png';
    this.imgPisoSendero.src     = '/bici-rush/piso_sendero.png'; 

    [1, 2, 3].forEach(n => {
      const img = new Image();
      img.src = `/bici-rush/biker_${n}.png`;
      this.spritesPedaleo.push(img);
    });
    this.spriteSalto.src = '/bici-rush/biker_jump.png';
  }

  ngOnDestroy() {
    // Limpieza absoluta de memoria, bucles de animación e intervalos activos
    this.detenerBucle();
    this.cronometro.detenerCronometro();
    this.limpiarIntervaloRevivir();
  }

  // ── CONTROL DE FLUJO DE JUEGO ────────────────────────────────────────────
  iniciarJuego() {
    this.limpiarIntervaloRevivir();
    this.detenerBucle();

    // Reset completo de Signals de Estado
    this.juegoCorriendo.set(true);
    this.juegoTerminado.set(false);
    this.esperandoRevivir.set(false);
    this.victoria.set(false);
    this.yaRevivio.set(false);
    this.mostrarBotonRevivir.set(false);
    this.monedasPartida.set(0);

    // Reset de variables de físicas y distancias
    this.metros.set(0);
    this.metrosInternos             = 0;
    this.obstaculoX                 = this.OBSTACULO_INICIAL_X;
    this.coinActiva                 = false;
    this.ciclistaY                  = this.SUELO_Y;
    this.ciclistaVelY               = 0;
    this.estaSaltando               = false;
    this.velocidadEscena            = this.VELOCIDAD_INICIAL; 
    this.fondoLejosX                = 0;
    this.frameContador              = 0;
    this.ultimoCheckpointVelocidad  = 0;

    // Gestión del tiempo
    this.cronometro.detenerCronometro();
    this.cronometro.iniciarCronometro();
    this.levantarCanvas();
  }

  private levantarCanvas() {
    // Retraso controlado para asegurar la correcta instanciación del ViewChild en el DOM
    setTimeout(() => {
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) return;
      this.ctx = canvas.getContext('2d')!;
      this.ctx.imageSmoothingEnabled = false; // Mantiene el estilo PixelArt definido sin blur
      this.bucleJuego();
    }, 50);
  }

  saltar() {
    // Solo permite la ejecución del salto si el personaje se encuentra firmemente asentado en el suelo
    if (!this.estaSaltando && this.juegoCorriendo() && !this.juegoTerminado() && !this.esperandoRevivir()) {
      this.ciclistaVelY = this.IMPULSO_SALTO;
      this.estaSaltando = true;
    }
  }

  bucleJuego() {
    // Cortocircuito del loop si el estado del juego no amerita procesamiento gráfico/físico
    if (!this.juegoCorriendo() || this.juegoTerminado() || this.esperandoRevivir()) return;

    this.actualizarFisicas();
    this.renderizarEscena();

    // Validación de condición de victoria basada en meta de metros alcanzada
    if (this.metros() >= this.METROS_VICTORIA) {
      this.finalizarPartida(true);
    } else {
      this.animationId = requestAnimationFrame(() => this.bucleJuego());
    }
  }

  // ── MOTOR FÍSICO Y SISTEMA DE COLISIONES CRÍTICAS ────────────────────────
  actualizarFisicas() {
    // 1. Progresión de distancias metros internos y actualización del Signal
    this.metrosInternos += this.INCREMENTO_METROS;
    this.metros.set(Math.floor(this.metrosInternos));

    // 2. Sistema de Dificultad Dinámica por Checkpoints de distancia
    const checkpoint = Math.floor(this.metrosInternos / this.CHECKPOINT_DISTANCIA);
    if (checkpoint > this.ultimoCheckpointVelocidad) {
      this.ultimoCheckpointVelocidad = checkpoint;
      this.velocidadEscena = Math.min(this.velocidadEscena + this.INCREMENTO_VELOCIDAD, this.VELOCIDAD_MAXIMA);
    }

    // 3. Desplazamiento del scroll de fondo y animación de brillos
    this.fondoLejosX -= this.velocidadEscena * this.MULTIPLICADOR_PARALLAX;
    this.animacionMoneda += this.MONEDA_INCREMENTO_ANIM;

    // Avanzar la animación de pedaleo únicamente si el jugador no está suspendido en el aire
    if (!this.estaSaltando) this.frameContador++;

    // 4. Integración de la Física de Gravedad y Salto (Ecuación de Movimiento)
    this.ciclistaY    += this.ciclistaVelY;
    this.ciclistaVelY += this.GRAVEDAD;
    
    // Restricción perimetral inferior (Caja de colisión contra el suelo del sendero)
    if (this.ciclistaY >= this.SUELO_Y) {
      this.ciclistaY    = this.SUELO_Y;
      this.ciclistaVelY = 0;
      this.estaSaltando = false;
    }

    // 5. Motor de Generación Procedural y Probabilística de Monedas
    if (!this.coinActiva && Math.random() < this.MONEDA_CHANCE_SPAWN && this.obstaculoX > this.MONEDA_MIN_X_SPAWN) {
      this.coinActiva = true;
      this.coinX = this.MONEDA_SPAWN_X;
      this.coinY = Math.random() > 0.5 ? this.SUELO_Y - this.MONEDA_ALTURA_BAJA_Y : this.SUELO_Y - this.MONEDA_ALTURA_ALTA_Y;
    }

    // Manejo de la Moneda Activa (Desplazamiento y Absorción)
    if (this.coinActiva) {
      this.coinX -= this.velocidadEscena;
      if (this.coinX < this.MONEDA_LIMIT_IZQ) this.coinActiva = false;

      // Detección de Colisión Circular/Cercanía con la Moneda utilizando los deltas parametrizados
      const distCoinX = Math.abs((this.coinX + this.MONEDA_CENTRO_OFFSET) - this.MONEDA_PLAYER_CENTRO_X); 
      const distCoinY = Math.abs((this.coinY + this.MONEDA_CENTRO_OFFSET) - (this.ciclistaY - this.MONEDA_PLAYER_CENTRO_Y_OFFSET));
      
      if (distCoinX < this.MONEDA_DIST_MAX_X && distCoinY < this.MONEDA_DIST_MAX_Y) {
        this.coinActiva = false;
        this.monedasPartida.update(m => m + this.VALOR_MONEDA);
        this.auth.actualizarMonedas(this.VALOR_MONEDA); 
      }
    }

    // 6. Desplazamiento y Reinicio del Obstáculo
    this.obstaculoX -= this.velocidadEscena;
    if (this.obstaculoX < this.OBSTACULO_LIMIT_IZQ) {
      this.obstaculoX         = this.OBSTACULO_SPAWN_X_BASE + Math.random() * this.OBSTACULO_SPAWN_X_RANDOM;
      this.tipoObstaculoActual = Math.random() > 0.5 ? 'roca' : 'tronco';
    }

    // 7. SISTEMA FORMAL DE COLISIONES FÍSICAS RECTANGULARES (AABB INTERSECTION)
    // Límites espaciales precisos del cuadro del Ciclista
    const ciclistaIzquierda = this.CICLISTA_RENDER_X + this.CICLISTA_COLL_OFFSET_X;
    const ciclistaDerecha   = ciclistaIzquierda + this.CICLISTA_COLL_ANCHO;
    const ciclistaAbajo     = this.ciclistaY;
    const ciclistaArriba    = this.ciclistaY - this.CICLISTA_COLL_ALTO;

    // Límites espaciales precisos del cuadro del Obstáculo
    const obstaculoIzquierda = this.obstaculoX + this.OBSTACULO_COLL_OFFSET_X;
    const obstaculoDerecha   = obstaculoIzquierda + this.OBSTACULO_COLL_ANCHO;
    const obstaculoArriba    = this.SUELO_Y - this.OBSTACULO_COLL_ALTO;
    const obstaculoAbajo     = this.SUELO_Y; // Apoyado sobre el suelo directamente

    // Comprobación de solapamiento en ambos ejes coordenados simultáneamente (Física rigurosa)
    const colisionaEjeX = obstaculoIzquierda < ciclistaDerecha && obstaculoDerecha > ciclistaIzquierda;
    const colisionaEjeY = ciclistaAbajo > obstaculoArriba && ciclistaArriba < obstaculoAbajo;

    if (colisionaEjeX && colisionaEjeY) {
      this.procesarDerrota();
    }
  }

  // ── MOTOR DE RENDERIZADO (CANVAS GRAPHICS CON VALORES REFERENCIALES) ────
  renderizarEscena() {
    // 1. Limpieza de pantalla por fotograma previo
    this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // 2. Renderizado del Fondo con efecto de Parallax Continuo (Se mantiene recto para simular el horizonte)
    if (this.imgFondoParallax.complete && this.imgFondoParallax.naturalWidth > 0) {
      const fX = this.fondoLejosX % this.CANVAS_WIDTH;
      this.ctx.drawImage(this.imgFondoParallax, fX, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      this.ctx.drawImage(this.imgFondoParallax, fX + this.CANVAS_WIDTH, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    } else {
      this.ctx.fillStyle = '#0b0d19';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    // ── INICIO DE MATRIZ DE INCLINACIÓN DE MONTAÑA ───────────────────────────
    // Guardamos el estado actual del lienzo, trasladamos el origen al suelo y rotamos hacia arriba
    this.ctx.save();
    this.ctx.translate(0, this.SUELO_Y);
    this.ctx.rotate(this.ANGULO_INCLINACION);
    this.ctx.translate(0, -this.SUELO_Y);

    // 3. Renderizado del Sendero (Le agregamos margen extra al ancho y alto para evitar huecos negros por la rotación)
    const MARGEN_ROTACION = 150;
    if (this.imgPisoSendero.complete && this.imgPisoSendero.naturalWidth > 0) {
      let pisoX = (this.fondoLejosX * this.MULTIPLICADOR_PISO) % this.CANVAS_WIDTH;
      const factorCorteTop = 0.50; 

      const srcX = 0;
      const srcY = this.imgPisoSendero.naturalHeight * factorCorteTop;
      const srcW = this.imgPisoSendero.naturalWidth;
      const srcH = this.imgPisoSendero.naturalHeight * (1 - factorCorteTop);
      const destH = this.CANVAS_HEIGHT - this.SUELO_Y; 

      this.ctx.drawImage(this.imgPisoSendero, srcX, srcY, srcW, srcH, pisoX, this.SUELO_Y, this.CANVAS_WIDTH + MARGEN_ROTACION, destH + MARGEN_ROTACION);
      this.ctx.drawImage(this.imgPisoSendero, srcX, srcY, srcW, srcH, pisoX + this.CANVAS_WIDTH, this.SUELO_Y, this.CANVAS_WIDTH + MARGEN_ROTACION, destH + MARGEN_ROTACION);
    } else {
      this.ctx.fillStyle = '#5d4037';
      this.ctx.fillRect(0, this.SUELO_Y, this.CANVAS_WIDTH + MARGEN_ROTACION, (this.CANVAS_HEIGHT - this.SUELO_Y) + MARGEN_ROTACION);
    }

    // 4. Renderizado y Efectos Lumínicos de Monedas
    if (this.coinActiva) {
      this.ctx.save();
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#ffd600';
      this.ctx.fillStyle = '#ffd600';
      this.ctx.beginPath();
      let radioEfecto = this.MONEDA_RADIO_EFECTO * Math.abs(Math.sin(this.animacionMoneda));
      this.ctx.arc(this.coinX + this.MONEDA_CENTRO_OFFSET, this.coinY + this.MONEDA_CENTRO_OFFSET, Math.max(radioEfecto, this.MONEDA_RADIO_MINIMO), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 5. Renderizado de Obstáculos
    const imgObs = this.tipoObstaculoActual === 'roca' ? this.imgObstaculoRoca : this.imgObstaculoTronco;
    if (imgObs.complete && imgObs.naturalWidth > 0) {
      this.ctx.drawImage(imgObs, this.obstaculoX, this.SUELO_Y - this.OBSTACULO_OFFSET_Y, this.OBSTACULO_ANCHO, this.OBSTACULO_ALTO);
    } else {
      this.ctx.fillStyle = this.tipoObstaculoActual === 'roca' ? '#475569' : '#854d0e';
      this.ctx.fillRect(this.obstaculoX, this.SUELO_Y + 15, this.OBSTACULO_ANCHO, this.OBSTACULO_ALTO);
    }

    // 6. Renderizado del Ciclista (Máquina de estados gráficos)
    let spriteActual: HTMLImageElement | null = null;
    if (this.estaSaltando) {
      spriteActual = this.spriteSalto;
    } else if (this.spritesPedaleo.length > 0) {
      const fi = Math.floor(this.frameContador / this.velocidadAnimacion) % this.spritesPedaleo.length;
      spriteActual = this.spritesPedaleo[fi];
    }

    if (spriteActual && spriteActual.complete && spriteActual.naturalWidth > 0) {
      this.ctx.drawImage(spriteActual, this.CICLISTA_RENDER_X, this.ciclistaY - this.CICLISTA_OFFSET_Y, this.CICLISTA_ANCHO, this.CICLISTA_ALTO);
    } else {
      this.dibujarCiclistaFallbackGrande();
    }

    // ── FIN DE MATRIZ DE INCLINACIÓN DE MONTAÑA ──────────────────────────────
    // Restauramos el lienzo original para que los menús o textos del HUD exteriores no salgan torcidos
    this.ctx.restore();
  }

  private dibujarCiclistaFallbackGrande() {
    // Renderizado alternativo mediante polígonos sólidos en caso de fallo de red en assets
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.fillRect(
      this.CICLISTA_RENDER_X + this.FALLBACK_OFFSET_X, 
      this.ciclistaY - this.FALLBACK_OFFSET_Y, 
      this.FALLBACK_ANCHO, 
      this.FALLBACK_ALTO
    );
  }

  // ── LÓGICA DE DERROTA Y RE-INTENTO TEMPORIZADO ───────────────────────────
  procesarDerrota() {
    this.detenerBucle();
    // Persistencia temporal del tramo cronometrado previo a la colisión
    this.tiempoGuardadoPrevio = this.cronometro.tiempoTranscurrido();
    this.cronometro.detenerCronometro();

    const puedeRevivir = !this.yaRevivio() && this.monedasUsuario() >= this.costoRevivir;
    this.juegoTerminado.set(true);

    if (puedeRevivir) {
      this.mostrarBotonRevivir.set(true);
      this.esperandoRevivir.set(true); 
      this.tiempoParaRevivir.set(this.TIEMPO_REVIVIR_MAX);  
      
      // Inicialización de la cuenta atrás reglamentaria de 10 segundos para revivir
      this.revivirIntervalId = setInterval(() => {
        this.tiempoParaRevivir.update(t => t - 1);
        
        if (this.tiempoParaRevivir() <= 0) {
          this.limpiarIntervaloRevivir();
          this.mostrarBotonRevivir.set(false);
          this.esperandoRevivir.set(false);
          this.finalizarPartida(false);
        }
      }, 1000);

    } else {
      this.finalizarPartida(false);
    }
  }

  async revivirPartida() {
    if (this.yaRevivio() || this.monedasUsuario() < this.costoRevivir || this.guardando()) return;

    this.limpiarIntervaloRevivir(); 
    this.guardando.set(true);
    
    // Débito transaccional de monedas desde el backend/auth service
    await this.auth.actualizarMonedas(-this.costoRevivir);

    this.yaRevivio.set(true);
    this.mostrarBotonRevivir.set(false);
    this.juegoTerminado.set(false);
    this.esperandoRevivir.set(false);

    // Reposicionamiento espacial defensivo para evitar colisión inmediata tras reaparecer
    this.obstaculoX   = this.OBSTACULO_INICIAL_X;
    this.coinActiva   = false;
    this.ciclistaY    = this.SUELO_Y;
    this.ciclistaVelY = 0;
    this.estaSaltando = false;
    
    this.guardando.set(false);
    
    // Suma acumulada de tiempos y reactivación del ticker del cronómetro
    this.tiempoGuardadoPrevio += this.cronometro.tiempoTranscurrido();
    this.cronometro.iniciarCronometro();
    
    this.juegoCorriendo.set(true);
    this.bucleJuego();
  }

  async presionarNuevaCarrera() {
    if (this.esperandoRevivir()) {
      this.limpiarIntervaloRevivir();
      await this.finalizarPartida(false);
    }
    this.iniciarJuego();
  }

  async presionarVolver() {
    this.detenerBucle();
    this.cronometro.detenerCronometro();
    
    if (this.esperandoRevivir()) {
      this.limpiarIntervaloRevivir();
      await this.finalizarPartida(false);
    }
    this.router.navigate(['/home']);
  }

  // ── FINALIZACIÓN Y ENVÍO DE DATOS ENLACES ────────────────────────────────
  async finalizarPartida(isWin: boolean) {
    if (this.guardando()) return;

    this.juegoTerminado.set(true);
    this.esperandoRevivir.set(false);
    this.victoria.set(isWin);
    this.mostrarBotonRevivir.set(false);
    this.guardando.set(true);

    // 🚀 NUEVA LÓGICA: Si ganó, le sumamos el bono a la partida y a su cuenta global
    if (isWin) {
      this.monedasPartida.update(m => m + this.BONO_VICTORIA_MONEDAS);
      await this.auth.actualizarMonedas(this.BONO_VICTORIA_MONEDAS);
    }

    // Integración de los segmentos temporales absolutos consumidos por el jugador
    const tiempoNuevo = this.cronometro.tiempoTranscurrido();
    const tiempoTotal = this.tiempoGuardadoPrevio + tiempoNuevo;

    const detalles: DetallesPartida = {
      monedasGanadas: this.monedasPartida(),
      distanciaMetros: this.metros(),
    };

    // Envío del payload estructurado al servicio rest encargado de los leaderboards
    await this.resultadosService.guardarResultado(
      'BICI_RUSH',
      this.metros(),
      isWin,
      tiempoTotal,
      detalles
    );
    this.guardando.set(false);
  }

  private limpiarIntervaloRevivir() {
    if (this.revivirIntervalId) {
      clearInterval(this.revivirIntervalId);
      this.revivirIntervalId = null;
    }
  }

  obtenerTiempoTotal(): string {
    // Cálculo unificado del tiempo real transcurrido
    const tiempoActual = this.cronometro.tiempoTranscurrido();
    const totalSegundos = this.tiempoGuardadoPrevio + tiempoActual;
    
    // Formateador explícito en formato tradicional (mm:ss)
    const mins = Math.floor(totalSegundos / 60);
    const secs = totalSegundos % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  detenerBucle() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }
}