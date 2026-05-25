import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultadosService } from '../../services/resultado';
import { CronometroService } from '../../services/cronometro';
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
  private resultadosService = inject(ResultadosService);
  private router = inject(Router);
  public cronometro = inject(CronometroService);

  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;

  metros = signal(0);
  juegoCorriendo = signal(false);
  juegoTerminado = signal(false);
  victoria = signal(false);
  guardando = signal(false);

  // Ajustes de dimensiones del nuevo Canvas (1000x450)
  private readonly SUELO_Y = 360; 
  private ciclistaY = 320; // Posición base sobre el suelo (SUELO_Y - altura de ruedas/bici)
  private ciclistaVelY = 0;
  private estaSaltando = false;
  
  // Ajustes físicos refinados para saltos más fluidos
  private gravedad = 0.6;
  private impulsoSalto = -13;
  private anguloInclinacion = 0.12; // Inclinación cuesta abajo del circuito

  private obstaculoX = 1100;
  private velocidadEscena = 7;
  private metrosInternos = 0; // Acumulador decimal para ralentizar el marcador de metros

  // Variables para el efecto Parallax (Fondo en movimiento)
  private fondoLejosX = 0;
  private fondoCercanoX = 0;

  @HostListener('window:keydown', ['$event'])
  manejarTeclado(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.saltar();
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.detenerBucle();
    this.cronometro.detenerCronometro();
  }

  iniciarJuego() {
    this.juegoCorriendo.set(true);
    this.juegoTerminado.set(false);
    this.victoria.set(false);
    this.metros.set(0);
    this.metrosInternos = 0;
    this.obstaculoX = 1100;
    this.ciclistaY = 320;
    this.velocidadEscena = 7;
    this.fondoLejosX = 0;
    this.fondoCercanoX = 0;

    this.cronometro.iniciarCronometro();

    setTimeout(() => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx = canvas.getContext('2d')!;
      // Forzar renderizado nítido estilo Pixel-Art
      this.ctx.imageSmoothingEnabled = false;
      this.bucleJuego();
    }, 50);
  }

  saltar() {
    if (!this.estaSaltando && this.juegoCorriendo() && !this.juegoTerminado()) {
      this.ciclistaVelY = this.impulsoSalto;
      this.estaSaltando = true;
    }
  }

  bucleJuego() {
    if (!this.juegoCorriendo() || this.juegoTerminado()) return;

    this.actualizarFisicas();
    this.renderizarEscena();

    if (this.metros() >= 2000) {
      this.finalizarPartida(true);
    } else {
      this.animationId = requestAnimationFrame(() => this.bucleJuego());
    }
  }

  actualizarFisicas() {
    // 1. CONTROL DE METROS MÁS LENTO: +0.15 metros por frame (~9m por segundo a 60fps)
    // De esta forma, llegar a 2000m tomará cerca de 3.5 minutos de juego emocionante.
    this.metrosInternos += 0.15;
    this.metros.set(Math.floor(this.metrosInternos));

    // Aumento gradual de velocidad por la bajada de la montaña
    if (this.metros() > 0 && this.metros() % 400 === 0) {
      this.velocidadEscena += 0.4;
    }

    // Movimiento de las capas del Parallax
    this.fondoLejosX -= this.velocidadEscena * 0.15;    // Montañas distantes avanzan lento
    this.fondoCercanoX -= this.velocidadEscena * 0.5;   // Los pinos y colinas avanzan a media velocidad

    // Físicas de gravedad del ciclista
    this.ciclistaY += this.ciclistaVelY;
    this.ciclistaVelY += this.gravedad;

    // Contacto con el suelo modificado
    if (this.ciclistaY >= 320) {
      this.ciclistaY = 320;
      this.ciclistaVelY = 0;
      this.estaSaltando = false;
    }

    // Desplazamiento del obstáculo rústico
    this.obstaculoX -= this.velocidadEscena;
    if (this.obstaculoX < -50) {
      this.obstaculoX = 1050 + Math.random() * 350;
    }

    // HITBOX MEJORADA: Sistema de colisión preciso basado en el nuevo tamaño
    const ciclistaFrente = 165;
    const ciclistaAtras = 120;
    const ciclistaAbajo = this.ciclistaY + 35; 

    const obstaculoIzquierda = this.obstaculoX;
    const obstaculoDerecha = this.obstaculoX + 35; // Ancho del tronco/roca
    const obstaculoArriba = this.SUELO_Y - 35;     // Alto del obstáculo

    if (obstaculoIzquierda < ciclistaFrente && obstaculoDerecha > ciclistaAtras) {
      if (ciclistaAbajo > obstaculoArriba) {
        this.finalizarPartida(false);
      }
    }
  }

  renderizarEscena() {
    // Limpieza de Canvas
    this.ctx.clearRect(0, 0, 1000, 450);

    // 1. DIBUJAR CIELO PIXEL-ART (Gradiente de atardecer de montaña)
    let gradientSky = this.ctx.createLinearGradient(0, 0, 0, 450);
    gradientSky.addColorStop(0, '#3b5998');
    gradientSky.addColorStop(0.6, '#8b9dc3');
    gradientSky.addColorStop(1, '#dfe3ee');
    this.ctx.fillStyle = gradientSky;
    this.ctx.fillRect(0, 0, 1000, 450);

    // Guardamos estado para aplicar la rotación de bajada de montaña a los elementos interactivos
    this.ctx.save();
    this.ctx.translate(0, 30);
    this.ctx.rotate(this.anguloInclinacion);

    // 2. CAPA PARALLAX 1: Montañas Lejanas (Bloques geométricos estilo retro)
    this.ctx.fillStyle = '#5c6bc0';
    let inicioM = (this.fondoLejosX % 400) - 400;
    for (let x = inicioM; x < 1500; x += 300) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.SUELO_Y);
      this.ctx.lineTo(x + 150, 120);
      this.ctx.lineTo(x + 300, this.SUELO_Y);
      this.ctx.fill();
    }

    // 3. CAPA PARALLAX 2: Bosque de Pinos Cercanos
    this.ctx.fillStyle = '#2e7d32';
    let inicioP = (this.fondoCercanoX % 160) - 160;
    for (let x = inicioP; x < 1500; x += 80) {
      // Dibujo de pino pixelado mediante capas de triángulos
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.SUELO_Y);
      this.ctx.lineTo(x + 25, 230);
      this.ctx.lineTo(x + 50, this.SUELO_Y);
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x + 5, this.SUELO_Y - 40);
      this.ctx.lineTo(x + 25, 200);
      this.ctx.lineTo(x + 45, this.SUELO_Y - 40);
      this.ctx.fill();
    }

    // 4. DIBUJAR EL SUELO (Sendero rústico de montaña)
    // Tierra de fondo
    this.ctx.fillStyle = '#5d4037';
    this.ctx.fillRect(-200, this.SUELO_Y, 1500, 200);
    // Capa superior de césped/pasto
    this.ctx.fillStyle = '#4caf50';
    this.ctx.fillRect(-200, this.SUELO_Y, 1500, 12);

    // 5. DIBUJAR OBSTÁCULO: Tronco / Roca Rústica (Pixel Style)
    this.ctx.fillStyle = '#795548'; // Color madera primario
    this.ctx.fillRect(this.obstaculoX, this.SUELO_Y - 35, 35, 35);
    // Detalles del tronco para efecto pixelado
    this.ctx.fillStyle = '#4e342e';
    this.ctx.fillRect(this.obstaculoX + 5, this.SUELO_Y - 28, 25, 6);
    this.ctx.fillRect(this.obstaculoX + 12, this.SUELO_Y - 15, 15, 6);

    // 6. DIBUJAR CICLISTA PIXEL-ART
    // Ruedas (Estilo llantas gruesas de MTB)
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#212121';
    // Rueda Trasera
    this.ctx.beginPath();
    this.ctx.arc(120, this.ciclistaY + 30, 10, 0, Math.PI * 2);
    this.ctx.stroke();
    // Rueda Delantera
    this.ctx.beginPath();
    this.ctx.arc(155, this.ciclistaY + 30, 10, 0, Math.PI * 2);
    this.ctx.stroke();

    // Cuadro de la bicicleta (Chasis naranja deportivo)
    this.ctx.strokeStyle = '#ff5722';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(120, this.ciclistaY + 30);
    this.ctx.lineTo(136, this.ciclistaY + 22); // Centro de pedalier
    this.ctx.lineTo(155, this.ciclistaY + 30);
    this.ctx.lineTo(148, this.ciclistaY + 10); // Manubrio
    this.ctx.lineTo(136, this.ciclistaY + 22);
    this.ctx.lineTo(128, this.ciclistaY + 12); // Asiento
    this.ctx.stroke();

    // Ciclista (Cuerpo y equipamiento con bloques tipo pixel)
    this.ctx.fillStyle = '#0288d1'; // Camiseta/Jersey Cyan
    this.ctx.fillRect(128, this.ciclistaY - 2, 14, 14);
    
    this.ctx.fillStyle = '#ffcc80'; // Piel / Rostro
    this.ctx.fillRect(134, this.ciclistaY - 12, 8, 10);
    
    this.ctx.fillStyle = '#d32f2f'; // Casco Rojo de protección
    this.ctx.fillRect(132, this.ciclistaY - 17, 12, 6);

    this.ctx.restore();
  }

  async finalizarPartida(isWin: boolean) {
    this.juegoTerminado.set(true);
    this.victoria.set(isWin);
    this.detenerBucle();
    this.cronometro.detenerCronometro();

    this.guardando.set(true);
    const segundos = this.cronometro.tiempoTranscurrido();

    const detallesExtras: DetallesPartida = {
      palabra: `Descenso de Montaña`,
      letrasSeleccionadas: this.metros(),
      errores: isWin ? 0 : 1
    };

    await this.resultadosService.guardarResultado(
      'BICI_RUSH',
      this.metros(), // El puntaje son los metros conquistados
      isWin,
      segundos,
      detallesExtras
    );
    this.guardando.set(false);
  
  }

  detenerBucle() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  volver() {
    this.detenerBucle();
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}