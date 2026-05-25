import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ResultadosService } from '../../services/resultado';
import { CronometroService } from '../../services/cronometro';
import { DetallesPartida } from '../../models/models';

interface TriviaQuestion {
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [CronometroService],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.css']
})
export class Preguntados implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private resultadosService = inject(ResultadosService);
  private router = inject(Router);
  public cronometro = inject(CronometroService);

  preguntas = signal<TriviaQuestion[]>([]);
  indiceActual = signal(0);
  acertadas = signal(0);
  juegoIniciado = signal(false);
  juegoTerminado = signal(false);
  guardando = signal(false);
  loading = signal(false);

  respuestaSeleccionada = signal<string | null>(null);
  respondido = signal(false);

  preguntaActual = computed(() => {
    const list = this.preguntas();
    const i = this.indiceActual();
    return list.length > 0 && i < list.length ? list[i] : null;
  });

  puntaje = computed(() => this.acertadas() * 15);
  victoria = computed(() => this.acertadas() >= 6); // Gana con 6 de 10 correctas

  ngOnInit() {
    this.obtenerPreguntas();
  }

  ngOnDestroy() {
    this.cronometro.detenerCronometro();
  }

  obtenerPreguntas() {
    this.loading.set(true);
    
    this.http.get<{ results: TriviaQuestion[] }>('https://opentdb.com/api.php?amount=10&category=9&type=multiple')
      .subscribe({
        next: (res) => {
          // 🚀 MAPEADO EXPLICITO: Definimos clave-valor campo por campo sin usar ...q
          const procesadas = res.results.map(q => ({
            category: q.category,
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
            // Mezclamos las opciones en caliente para esta pregunta
            all_answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)
          }));

          this.preguntas.set(procesadas);
          this.loading.set(false);
          this.juegoIniciado.set(true);
          this.cronometro.iniciarCronometro();
        },
        error: () => this.loading.set(false)
      });
  }

  // Método para verificar si ya se ha respondido a una pregunta
  verificarRespuesta(opcion: string) {
    if (this.respondido()) return;

    this.respuestaSeleccionada.set(opcion);
    this.respondido.set(true);

    if (opcion === this.preguntaActual()?.correct_answer) {
      // Si es la respuesta correcta, incrementamos el contador de aciertos
      this.acertadas.update(v => v + 1);
    }

    setTimeout(() => this.siguientePregunta(), 1500);
  }

  siguientePregunta() {
    this.respondido.set(false);
    this.respuestaSeleccionada.set(null);

    // Si no hay más preguntas, terminamos el juego
    if (this.indiceActual() < 9) {
      this.indiceActual.update(v => v + 1);
    } else {
      this.juegoTerminado.set(true);
      this.cronometro.detenerCronometro();
      this.guardarResultados();
    }
  }

  async guardarResultados() {
    this.guardando.set(true);
    const segundos = this.cronometro.tiempoTranscurrido();

    const detallesExtras: DetallesPartida = {
      preguntasAcertadas: this.acertadas()
    };

    await this.resultadosService.guardarResultado(
      'PREGUNTADOS',
      this.puntaje(),
      this.victoria(),
      segundos,
      detallesExtras
    );
    this.guardando.set(false);
  }

  reiniciar() {
    this.indiceActual.set(0);
    this.acertadas.set(0);
    this.juegoTerminado.set(false);
    this.obtenerPreguntas();
  }

  volver() {
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}